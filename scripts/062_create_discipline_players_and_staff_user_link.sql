-- Crear tabla para jugadores de disciplinas (vinculados a usuarios)
CREATE TABLE IF NOT EXISTS "DisciplinePlayers" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  position TEXT, -- "Delantero", "Mediocampista", "Defensor", etc.
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discipline_id, user_id) -- Un usuario puede estar en cada disciplina solo una vez
);

-- Agregar user_id a DisciplineStaff para vincular con usuarios
ALTER TABLE "DisciplineStaff" 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_discipline_players_discipline ON "DisciplinePlayers"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_discipline_players_user ON "DisciplinePlayers"(user_id);
CREATE INDEX IF NOT EXISTS idx_discipline_players_active ON "DisciplinePlayers"(is_active);
CREATE INDEX IF NOT EXISTS idx_discipline_staff_user ON "DisciplineStaff"(user_id);

-- Función para actualizar automáticamente el player_count en Disciplines
CREATE OR REPLACE FUNCTION update_discipline_player_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el conteo de jugadores activos
  UPDATE "Disciplines"
  SET player_count = (
    SELECT COUNT(*)
    FROM "DisciplinePlayers"
    WHERE discipline_id = COALESCE(NEW.discipline_id, OLD.discipline_id)
      AND is_active = true
  )
  WHERE id = COALESCE(NEW.discipline_id, OLD.discipline_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar player_count automáticamente
DROP TRIGGER IF EXISTS trigger_update_player_count_insert ON "DisciplinePlayers";
CREATE TRIGGER trigger_update_player_count_insert
AFTER INSERT ON "DisciplinePlayers"
FOR EACH ROW
EXECUTE FUNCTION update_discipline_player_count();

DROP TRIGGER IF EXISTS trigger_update_player_count_update ON "DisciplinePlayers";
CREATE TRIGGER trigger_update_player_count_update
AFTER UPDATE ON "DisciplinePlayers"
FOR EACH ROW
EXECUTE FUNCTION update_discipline_player_count();

DROP TRIGGER IF EXISTS trigger_update_player_count_delete ON "DisciplinePlayers";
CREATE TRIGGER trigger_update_player_count_delete
AFTER DELETE ON "DisciplinePlayers"
FOR EACH ROW
EXECUTE FUNCTION update_discipline_player_count();
