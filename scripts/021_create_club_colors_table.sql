-- Crear tabla de colores del club
CREATE TABLE IF NOT EXISTS "ClubColors" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  hex_value VARCHAR(7) NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar colores oficiales del club
INSERT INTO "ClubColors" (name, hex_value, description, is_primary, display_order) VALUES
('Verde', '#2e8b58', 'Color verde principal del club', true, 1),
('Amarillo', '#ffd700', 'Color amarillo principal del club', true, 2),
('Blanco', '#ffffff', 'Color blanco del club', false, 3),
('Negro', '#000000', 'Color negro del club', false, 4),
('Azul', '#020817', 'Color azul del club', false, 5)
ON CONFLICT (name) DO UPDATE SET
  hex_value = EXCLUDED.hex_value,
  description = EXCLUDED.description,
  is_primary = EXCLUDED.is_primary,
  display_order = EXCLUDED.display_order;

-- Agregar columnas para color del botón del banner
ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS header_banner_button_color VARCHAR(7) DEFAULT '#2e8b58',
ADD COLUMN IF NOT EXISTS header_banner_button_color_dark VARCHAR(7) DEFAULT '#ffd700',
ADD COLUMN IF NOT EXISTS header_banner_button_text_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS header_banner_button_text_color_dark VARCHAR(7) DEFAULT '#000000';

-- Comentarios para documentar
COMMENT ON TABLE "ClubColors" IS 'Almacena los colores oficiales del club para usar en toda la aplicación';
COMMENT ON COLUMN "SiteConfig".header_banner_button_color IS 'Color del botón del banner en modo claro';
COMMENT ON COLUMN "SiteConfig".header_banner_button_color_dark IS 'Color del botón del banner en modo oscuro';
