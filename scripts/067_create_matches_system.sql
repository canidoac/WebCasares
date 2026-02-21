-- Sistema completo de gestión de partidos, resultados y notificaciones

-- Tabla de Torneos
CREATE TABLE IF NOT EXISTS "Tournaments" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Ubicaciones
CREATE TABLE IF NOT EXISTS "Locations" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Partidos/Fechas
CREATE TABLE IF NOT EXISTS "Matches" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES "Tournaments"(id) ON DELETE SET NULL,
  location_id INTEGER REFERENCES "Locations"(id) ON DELETE SET NULL,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  rival_team TEXT NOT NULL,
  match_type TEXT, -- 'regular', 'cuartos', 'semifinal', 'final', etc.
  is_home BOOLEAN DEFAULT true, -- true = local, false = visitante
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  created_by INTEGER REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Resultados
CREATE TABLE IF NOT EXISTS "MatchResults" (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES "Matches"(id) ON DELETE CASCADE UNIQUE,
  our_score INTEGER NOT NULL,
  rival_score INTEGER NOT NULL,
  scorers JSONB, -- Array de {player_id, player_name, goals/points}
  notes TEXT,
  created_by INTEGER REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS "Notifications" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'match_result_pending', 'general', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL a donde debe ir
  match_id INTEGER REFERENCES "Matches"(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación Roles-Disciplinas (roles granulares)
CREATE TABLE IF NOT EXISTS "RoleDisciplines" (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES "SiteRole"(id) ON DELETE CASCADE,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  can_manage_matches BOOLEAN DEFAULT true,
  can_manage_results BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, discipline_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_matches_discipline ON "Matches"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON "Matches"(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON "Matches"(status);
CREATE INDEX IF NOT EXISTS idx_match_results_match ON "MatchResults"(match_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON "Notifications"(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON "Notifications"(is_read);
CREATE INDEX IF NOT EXISTS idx_role_disciplines_role ON "RoleDisciplines"(role_id);
CREATE INDEX IF NOT EXISTS idx_role_disciplines_discipline ON "RoleDisciplines"(discipline_id);

-- Insertar ubicaciones comunes iniciales
INSERT INTO "Locations" (name, address, city) VALUES
('Estadio Club Carlos Casares', 'Av. Principal 123', 'Buenos Aires'),
('Complejo Deportivo Norte', 'Calle Norte 456', 'Buenos Aires'),
('Polideportivo Municipal', 'Av. del Libertador 789', 'Buenos Aires')
ON CONFLICT DO NOTHING;

-- Insertar torneos comunes iniciales
INSERT INTO "Tournaments" (name, description, start_date, is_active) VALUES
('Liga Regional Amateur 2025', 'Torneo oficial de la liga regional', '2025-03-01', true),
('Copa Provincial 2025', 'Copa eliminatoria provincial', '2025-04-15', true),
('Torneo Amistoso Invierno', 'Torneos amistosos de temporada baja', '2025-06-01', true)
ON CONFLICT DO NOTHING;

-- Función para crear notificaciones automáticas 24hs después del partido
CREATE OR REPLACE FUNCTION check_pending_results()
RETURNS void AS $$
DECLARE
  match_record RECORD;
  delegate_user RECORD;
BEGIN
  -- Buscar partidos que pasaron hace más de 24 horas sin resultado
  FOR match_record IN
    SELECT m.*, d.name as discipline_name
    FROM "Matches" m
    JOIN "Disciplines" d ON d.id = m.discipline_id
    WHERE m.status = 'scheduled'
    AND m.match_date < CURRENT_DATE - INTERVAL '1 day'
    AND NOT EXISTS (
      SELECT 1 FROM "MatchResults" mr WHERE mr.match_id = m.id
    )
  LOOP
    -- Encontrar delegados con permiso para esa disciplina
    FOR delegate_user IN
      SELECT DISTINCT u.id, u.first_name, u.last_name
      FROM "User" u
      JOIN "SiteRole" sr ON sr.id = u.role_id
      JOIN "RoleDisciplines" rd ON rd.role_id = sr.id
      WHERE rd.discipline_id = match_record.discipline_id
      AND rd.can_manage_results = true
    LOOP
      -- Crear notificación si no existe ya
      INSERT INTO "Notifications" (user_id, type, title, message, link, match_id)
      SELECT 
        delegate_user.id,
        'match_result_pending',
        'Resultado pendiente',
        'El partido de ' || match_record.discipline_name || ' contra ' || match_record.rival_team || ' necesita que cargues el resultado',
        '/admin/disciplinas/' || match_record.discipline_id || '/partidos/' || match_record.id || '/resultado',
        match_record.id
      WHERE NOT EXISTS (
        SELECT 1 FROM "Notifications" 
        WHERE user_id = delegate_user.id 
        AND match_id = match_record.id 
        AND type = 'match_result_pending'
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE "Tournaments" IS 'Torneos deportivos donde participa el club';
COMMENT ON TABLE "Locations" IS 'Ubicaciones/canchas donde se juegan los partidos';
COMMENT ON TABLE "Matches" IS 'Partidos/fechas programadas para cada disciplina';
COMMENT ON TABLE "MatchResults" IS 'Resultados de los partidos con goleadores/anotadores';
COMMENT ON TABLE "Notifications" IS 'Notificaciones para usuarios (delegados, admins, etc)';
COMMENT ON TABLE "RoleDisciplines" IS 'Relación muchos a muchos entre roles y disciplinas para permisos granulares';
