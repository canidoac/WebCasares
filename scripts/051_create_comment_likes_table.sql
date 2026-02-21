-- Crear tabla para likes en comentarios
CREATE TABLE IF NOT EXISTS "CommentLikes" (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES "NewsComments"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id),
  CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES "NewsComments"(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_comment_like FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON "CommentLikes"(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON "CommentLikes"(user_id);
