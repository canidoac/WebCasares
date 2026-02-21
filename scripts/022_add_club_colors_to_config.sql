-- Script para agregar colores del club a las variables CSS
-- Este script permite usar los colores del club en toda la aplicación

-- Agregar columnas para almacenar si se usan colores del club
ALTER TABLE "SiteConfig"
ADD COLUMN IF NOT EXISTS use_club_colors BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS primary_club_color TEXT DEFAULT '#2e8b58',
ADD COLUMN IF NOT EXISTS secondary_club_color TEXT DEFAULT '#ffd700',
ADD COLUMN IF NOT EXISTS accent_club_color TEXT DEFAULT '#020817';

-- Comentario explicativo
COMMENT ON COLUMN "SiteConfig".use_club_colors IS 'Si es true, usa los colores del club en toda la aplicación';
COMMENT ON COLUMN "SiteConfig".primary_club_color IS 'Color primario del club (verde por defecto)';
COMMENT ON COLUMN "SiteConfig".secondary_club_color IS 'Color secundario del club (amarillo por defecto)';
COMMENT ON COLUMN "SiteConfig".accent_club_color IS 'Color de acento del club (azul por defecto)';

-- Actualizar la configuración existente
UPDATE "SiteConfig"
SET 
  use_club_colors = true,
  primary_club_color = '#2e8b58',
  secondary_club_color = '#ffd700',
  accent_club_color = '#020817'
WHERE id = 1;
