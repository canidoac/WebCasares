-- Crear tabla para likes de noticias
CREATE TABLE IF NOT EXISTS "NewsLikes" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES "News"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, -- Cambié UUID a INTEGER y "ID" a id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_news_like UNIQUE (news_id, user_id),
  CONSTRAINT fk_news FOREIGN KEY (news_id) REFERENCES "News"(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE -- Cambié "ID" a id
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_news_likes_news ON "NewsLikes"(news_id);
CREATE INDEX IF NOT EXISTS idx_news_likes_user ON "NewsLikes"(user_id);
