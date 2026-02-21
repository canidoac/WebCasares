-- Agregar columnas para el sistema de estado del sitio y personalización

-- Sistema de estado del sitio (reemplaza maintenance_mode con un enum más completo)
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS site_status TEXT DEFAULT 'online' CHECK (site_status IN ('online', 'maintenance', 'coming_soon'));

-- Columnas para modo "Próximamente"
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS coming_soon_title TEXT DEFAULT 'Próximamente';

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS coming_soon_message TEXT DEFAULT 'Estamos preparando algo especial para ti. ¡Vuelve pronto!';

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS coming_soon_image TEXT;

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS coming_soon_launch_date TIMESTAMPTZ;

-- Colores del banner para modo claro y oscuro
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS header_banner_color_dark TEXT DEFAULT '#fbbf24';

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS header_banner_text_color_dark TEXT DEFAULT '#000000';

-- Opacidad del popup de bienvenida (0-100)
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS popup_opacity INTEGER DEFAULT 80 CHECK (popup_opacity >= 0 AND popup_opacity <= 100);

-- Actualizar los registros existentes para que usen el nuevo sistema
UPDATE "SiteConfig"
SET site_status = CASE 
  WHEN maintenance_mode = true THEN 'maintenance'
  ELSE 'online'
END
WHERE site_status IS NULL OR site_status = 'online';

-- Comentarios para referencia futura
COMMENT ON COLUMN "SiteConfig".site_status IS 'Estado del sitio: online (funcionando normal), maintenance (en mantenimiento), coming_soon (próximamente con countdown)';
COMMENT ON COLUMN "SiteConfig".coming_soon_title IS 'Título de la página de Próximamente';
COMMENT ON COLUMN "SiteConfig".coming_soon_message IS 'Mensaje de la página de Próximamente';
COMMENT ON COLUMN "SiteConfig".coming_soon_image IS 'URL de la imagen para la página de Próximamente';
COMMENT ON COLUMN "SiteConfig".coming_soon_launch_date IS 'Fecha de lanzamiento para el modo coming_soon con countdown en meses, días, horas, minutos y segundos';
COMMENT ON COLUMN "SiteConfig".header_banner_color_dark IS 'Color de fondo del banner en modo oscuro';
COMMENT ON COLUMN "SiteConfig".header_banner_text_color_dark IS 'Color del texto del banner en modo oscuro';
COMMENT ON COLUMN "SiteConfig".popup_opacity IS 'Opacidad del popup de bienvenida (0-100)';
