-- Crear tabla de relación many-to-many entre News y Disciplines
CREATE TABLE IF NOT EXISTS "NewsDisciplines" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES "News"(id) ON DELETE CASCADE,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, discipline_id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_news_disciplines_news ON "NewsDisciplines"(news_id);
CREATE INDEX IF NOT EXISTS idx_news_disciplines_discipline ON "NewsDisciplines"(discipline_id);

-- Índice compuesto para consultas bidireccionales
CREATE INDEX IF NOT EXISTS idx_news_disciplines_both ON "NewsDisciplines"(news_id, discipline_id);
