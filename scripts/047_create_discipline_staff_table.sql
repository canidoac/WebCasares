-- Crear tabla para cuerpo técnico de disciplinas
CREATE TABLE IF NOT EXISTS "DisciplineStaff" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- "DT Principal", "Ayudante de Campo", "Preparador Físico", etc.
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Eliminada la constraint FOREIGN KEY duplicada fk_discipline
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_discipline_staff_discipline ON "DisciplineStaff"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_discipline_staff_order ON "DisciplineStaff"(display_order);
