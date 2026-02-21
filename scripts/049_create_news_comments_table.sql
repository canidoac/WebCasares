-- Crear tabla para comentarios de noticias
CREATE TABLE IF NOT EXISTS "NewsComments" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES "News"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, -- Cambié UUID a INTEGER y "ID" a id
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_news FOREIGN KEY (news_id) REFERENCES "News"(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE -- Cambié "ID" a id
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_news_comments_news ON "NewsComments"(news_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_user ON "NewsComments"(user_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_created ON "NewsComments"(created_at DESC);
