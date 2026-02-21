-- Agregar nuevas columnas a la tabla News
ALTER TABLE "News" 
ADD COLUMN IF NOT EXISTS show_in_carousel BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS comments_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS content_html TEXT,
-- Agregar columna para tipo de media (imagen, video, youtube, gif)
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'gif', 'video', 'youtube'));

-- Actualizar descripciones cortas para noticias existentes
UPDATE "News" 
SET short_description = LEFT(description, 150) || '...'
WHERE short_description IS NULL;

-- Crear tabla para múltiples imágenes de noticias
CREATE TABLE IF NOT EXISTS "NewsImages" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  -- Agregar columna para tipo de media adicional
  media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'gif', 'video', 'youtube')),
  is_primary BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_news_images_news FOREIGN KEY (news_id) 
    REFERENCES "News"(id) ON DELETE CASCADE
);

-- Migrar imágenes existentes a la nueva tabla
INSERT INTO "NewsImages" (news_id, image_url, is_primary, position)
SELECT id, image_url, true, 0
FROM "News"
WHERE image_url IS NOT NULL;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_news_show_in_carousel ON "News"(show_in_carousel);
CREATE INDEX IF NOT EXISTS idx_news_images_news_id ON "NewsImages"(news_id);
CREATE INDEX IF NOT EXISTS idx_news_images_position ON "NewsImages"(position);
-- Agregar índice para optimizar consultas por tipo de media
CREATE INDEX IF NOT EXISTS idx_news_media_type ON "News"(media_type);

-- Comentarios explicativos
COMMENT ON COLUMN "News"."media_type" IS 'Tipo de media principal: image (JPG/PNG), gif, video (MP4/WebM) o youtube';
COMMENT ON COLUMN "NewsImages"."media_type" IS 'Tipo de media adicional: image, gif, video o youtube';
