-- Agregar columna media_type a la tabla News para identificar el tipo de contenido multimedia

-- Agregar la columna media_type
ALTER TABLE "News"
ADD COLUMN IF NOT EXISTS "media_type" TEXT DEFAULT 'image';

-- Agregar un comentario explicativo
COMMENT ON COLUMN "News"."media_type" IS 'Tipo de contenido multimedia: image, youtube, video';

-- Actualizar registros existentes que tengan URLs de YouTube
UPDATE "News"
SET "media_type" = 'youtube'
WHERE "image" LIKE '%youtube.com%' OR "image" LIKE '%youtu.be%' OR "action_url" LIKE '%youtube.com%' OR "action_url" LIKE '%youtu.be%';

-- Crear índice para mejorar consultas filtradas por tipo de media
CREATE INDEX IF NOT EXISTS "idx_news_media_type" ON "News"("media_type");
