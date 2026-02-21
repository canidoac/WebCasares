-- Agregar columnas para configuración del botón del banner

-- Agregar columna para texto del botón del banner
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS header_banner_button_text TEXT DEFAULT 'Ir';

-- Agregar columna para habilitar/deshabilitar el botón
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS header_banner_show_button BOOLEAN DEFAULT true;

-- Comentarios descriptivos
COMMENT ON COLUMN "SiteConfig".header_banner_button_text IS 'Texto del botón que aparece en el banner superior';
COMMENT ON COLUMN "SiteConfig".header_banner_show_button IS 'Controla si se muestra el botón en el banner superior';
