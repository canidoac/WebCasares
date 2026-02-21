-- Agregar columnas avanzadas para status coming_soon y maintenance

-- 1. URL de redirección cuando termina el contador
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS redirect_url TEXT;

-- 2. Auto-cambiar a estado online cuando termina el contador
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS auto_switch_to_online BOOLEAN DEFAULT false;

-- 3. Video final que se muestra al terminar el countdown
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS final_video_url TEXT;

-- 4. Música de fondo (mp3/mp4)
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS background_music_url TEXT;

-- 5. Auto-reproducir música
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS music_autoplay BOOLEAN DEFAULT false;

-- 6. Volumen inicial de la música (0-1)
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS music_volume REAL DEFAULT 0.5;

-- Agregar 'gif' como tipo de media válido
ALTER TABLE "SiteStatus" 
DROP CONSTRAINT IF EXISTS "SiteStatus_media_type_check";

ALTER TABLE "SiteStatus" 
ADD CONSTRAINT "SiteStatus_media_type_check" 
CHECK (media_type IN ('none', 'image', 'video', 'gif'));

COMMENT ON COLUMN "SiteStatus"."redirect_url" IS 'URL a la que redirigir cuando termine el countdown';
COMMENT ON COLUMN "SiteStatus"."auto_switch_to_online" IS 'Si TRUE, cambia automáticamente el sitio a online cuando termina el countdown';
COMMENT ON COLUMN "SiteStatus"."final_video_url" IS 'Video que se muestra al terminar el countdown antes de redirigir';
COMMENT ON COLUMN "SiteStatus"."background_music_url" IS 'Audio de fondo (mp3/mp4) que se reproduce durante el countdown';
COMMENT ON COLUMN "SiteStatus"."music_autoplay" IS 'Auto-reproducir música de fondo';
COMMENT ON COLUMN "SiteStatus"."music_volume" IS 'Volumen inicial de la música (0.0 a 1.0)';
