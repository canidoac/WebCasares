-- Añadir campos de modo mantenimiento a la tabla SiteConfig
ALTER TABLE "SiteConfig"
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_title TEXT DEFAULT 'Sitio en Mantenimiento',
ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT 'Estamos trabajando para mejorar tu experiencia. Vuelve pronto.',
ADD COLUMN IF NOT EXISTS maintenance_media_type TEXT CHECK (maintenance_media_type IN ('none', 'image', 'video')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS maintenance_media_url TEXT,
ADD COLUMN IF NOT EXISTS maintenance_show_countdown BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_launch_date TIMESTAMPTZ;

-- Comentarios para documentación
COMMENT ON COLUMN "SiteConfig".maintenance_mode IS 'Activa el modo mantenimiento en todo el sitio';
COMMENT ON COLUMN "SiteConfig".maintenance_title IS 'Título mostrado en la página de mantenimiento';
COMMENT ON COLUMN "SiteConfig".maintenance_message IS 'Mensaje mostrado en la página de mantenimiento';
COMMENT ON COLUMN "SiteConfig".maintenance_media_type IS 'Tipo de media: none, image, video';
COMMENT ON COLUMN "SiteConfig".maintenance_media_url IS 'URL de la imagen o video de mantenimiento';
COMMENT ON COLUMN "SiteConfig".maintenance_show_countdown IS 'Mostrar contador regresivo hasta fecha de lanzamiento';
COMMENT ON COLUMN "SiteConfig".maintenance_launch_date IS 'Fecha y hora en que el sitio estará online';
