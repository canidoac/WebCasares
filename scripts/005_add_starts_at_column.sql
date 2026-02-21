-- Añadir columna de fecha de inicio a la tabla News
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear índice para la fecha de inicio
CREATE INDEX IF NOT EXISTS idx_news_starts_at ON "News"(starts_at);

-- Actualizar noticias existentes para que tengan fecha de inicio en el pasado
UPDATE "News" SET starts_at = created_at WHERE starts_at IS NULL;
