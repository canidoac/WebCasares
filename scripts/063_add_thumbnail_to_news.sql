-- Agregar columna thumbnail_url para imagen de portada de videos
ALTER TABLE "News" 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Comentario explicativo
COMMENT ON COLUMN "News"."thumbnail_url" IS 'URL de imagen de portada para mostrar cuando media_type es video o youtube en tarjetas pequeñas';
