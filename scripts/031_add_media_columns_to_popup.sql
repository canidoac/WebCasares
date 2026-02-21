-- Agregar columnas para media (imágenes, GIFs, videos) en popups
ALTER TABLE "SitePopup" 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) CHECK (media_type IN ('image', 'gif', 'video'));

COMMENT ON COLUMN "SitePopup".media_url IS 'URL del medio (imagen, GIF o video) alojado en Blob Storage o externo';
COMMENT ON COLUMN "SitePopup".media_type IS 'Tipo de medio: image, gif, o video';

-- Migrar image_url existente a media_url y establecer tipo
UPDATE "SitePopup" 
SET media_url = image_url, media_type = 'image' 
WHERE image_url IS NOT NULL AND image_url != '';
