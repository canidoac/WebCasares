-- Agregar columnas para opciones de video
ALTER TABLE "SitePopup"
ADD COLUMN IF NOT EXISTS video_autoplay BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_muted BOOLEAN DEFAULT true;

COMMENT ON COLUMN "SitePopup".video_autoplay IS 'Si el video debe auto-reproducirse';
COMMENT ON COLUMN "SitePopup".video_muted IS 'Si el video debe iniciar sin sonido';
