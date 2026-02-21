-- Añadir columnas faltantes a la tabla SiteConfig

-- Columnas del banner
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS header_banner_text_color TEXT DEFAULT '#ffffff';

-- Columnas del modo mantenimiento
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_title TEXT DEFAULT 'Sitio en Mantenimiento';

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT 'Estamos trabajando para mejorar tu experiencia. Volvemos pronto.';

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_media_type TEXT DEFAULT 'none' CHECK (maintenance_media_type IN ('none', 'image', 'video'));

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_media_url TEXT;

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_show_countdown BOOLEAN DEFAULT false;

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS maintenance_launch_date TIMESTAMPTZ;
