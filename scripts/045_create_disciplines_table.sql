-- Crear tabla para disciplinas deportivas
CREATE TABLE IF NOT EXISTS "Disciplines" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Nombre del icono de lucide-react
  foundation_year INTEGER,
  current_tournament TEXT,
  player_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar disciplinas iniciales
INSERT INTO "Disciplines" (name, slug, description, icon, foundation_year, current_tournament, player_count, display_order) VALUES
('Fútbol 11', 'futbol-11', 'La máxima categoría del fútbol competitivo. Equipos completos en cancha grande.', 'CircleDot', 2017, 'Liga Regional Amateur', 32, 1),
('Fútbol 9', 'futbol-9', 'Fútbol de campo reducido con equipos de 9 jugadores.', 'CircleDot', 2018, 'Torneo Interuniversitario', 25, 2),
('Fútbol 5 Femenino', 'futbol-5-femenino', 'Fútbol femenino en cancha reducida.', 'CircleDot', 2019, 'Liga Femenina CABA', 18, 3),
('Básquet', 'basquet', 'Basketball competitivo representando al club.', 'Circle', 2018, 'Liga Universitaria', 15, 4),
('Hockey', 'hockey', 'Hockey sobre césped y patines.', 'Minus', 2019, 'Torneo Metropolitano', 20, 5),
('Voley Mixto', 'voley-mixto', 'Volleyball mixto recreativo y competitivo.', 'Circle', 2020, 'Liga Amateur Mixta', 22, 6),
('Running', 'running', 'Grupo de running y atletismo.', 'PersonStanding', 2020, 'Maratones y Carreras', 30, 7)
ON CONFLICT (slug) DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_disciplines_active ON "Disciplines"(is_active);
CREATE INDEX IF NOT EXISTS idx_disciplines_order ON "Disciplines"(display_order);
CREATE INDEX IF NOT EXISTS idx_disciplines_slug ON "Disciplines"(slug);
