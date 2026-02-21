-- Crear tabla para imágenes de disciplinas
CREATE TABLE IF NOT EXISTS "DisciplineImages" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Eliminada la segunda constraint FOREIGN KEY duplicada que causaba el error

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_discipline_images_discipline ON "DisciplineImages"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_discipline_images_order ON "DisciplineImages"(display_order);
