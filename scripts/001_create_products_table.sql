-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS "Products" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_front TEXT NOT NULL,
  image_back TEXT,
  badge TEXT,
  description TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  is_3d BOOLEAN DEFAULT false,
  render_3d_url TEXT,
  variants JSONB,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar productos existentes
INSERT INTO "Products" (id, name, price, image_front, image_back, badge, description, in_stock, category) VALUES
('camiseta-gris-f11-2025', 'Camiseta Gris F11 2025', 22000, '/images/products/camiseta-gris-frente.png', '/images/products/camiseta-gris-dorso.png', 'Nueva', 'Nueva Camiseta oficial de F11 para la temporada 2025. Diseño moderno en color gris con detalles en los colores del club.', true, 'camisetas'),
('camiseta-f5-femenino-2025', 'Camiseta F5 Femenino 2025', 22000, '/images/products/camiseta-f5-femenino-frente.png', '/images/products/camiseta-f5-femenino-dorso.png', 'Nueva', 'Camiseta oficial del equipo femenino del Club para la temporada 2025.', true, 'camisetas'),
('camiseta-roja-aviador', 'Camiseta Arquero Malatini', 22000, '/images/products/camiseta-roja-frente.png', '/images/products/camiseta-roja-dorso.png', 'Edición Especial', 'Camiseta de arquero con un diseño único en degradé rojo a negro en homenaje al Piloto Acrobático de Avión Casarense Jorge Malatini.', true, 'camisetas'),
('camiseta-arquero-mouras-amarilla', 'Camiseta Arquero Mouras Amarilla', 22000, '/images/products/camiseta-amarilla-frente.png', '/images/products/camiseta-amarilla-dorso.png', 'Edición Especial', 'Camiseta de arquero en color amarillo con diseño moderno en homenaje al deportista N1 de la ciudad Roberto Mouras.', true, 'camisetas'),
('camiseta-negra-edicion-especial', 'Camiseta Arquero Mouras Neg/Dor', 22000, '/images/products/camiseta-negra-dorada-frente.png', '/images/products/camiseta-negra-dorada-dorso.png', 'Edición Especial', 'Camiseta de arquero en color negro con detalles dorados. Homenaje al deportista N1 de la ciudad Roberto Mouras.', true, 'camisetas'),
('camiseta-blanca-quales', 'Camiseta Blanca F11 2024', 22000, '/images/products/camiseta-blanca-frente.png', '/images/products/camiseta-blanca-dorso.png', NULL, 'Camiseta F11 temporada 2024/2025.', true, 'camisetas'),
('camiseta-verde-rayada', 'Camiseta Titular F9', 22000, '/images/products/camiseta-verde-frente.png', '/images/products/camiseta-verde-dorso.png', NULL, 'Camiseta titular fútbol 9. Diseño a rayas verticales verdes y blancas con detalles en amarillo.', true, 'camisetas'),
('vaso-ccc-plastico', 'Vaso CCC Plastico 500cc', 5000, '/images/products/vaso-gris.png', NULL, NULL, 'Vaso oficial del Club Carlos Casares con capacidad de 500cc. Fabricado en plástico resistente y reutilizable, ideal para eventos deportivos y celebraciones.', false, 'accesorios')
ON CONFLICT (id) DO NOTHING;

-- Actualizar el vaso con sus variantes y render 3D
UPDATE "Products" 
SET 
  is_3d = true,
  render_3d_url = 'https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836569693.jpg&tipo=copo&id_cor_tampa=&time=1746836569693',
  variants = '[
    {
      "id": "gris",
      "name": "Transparente",
      "image": "/images/products/vaso-gris.png",
      "color": "transparent",
      "border": true,
      "render3DURL": "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836643851.png&tipo=copo&id_cor_tampa=&time=1746836643851&id_tipo=1"
    },
    {
      "id": "blanco",
      "name": "Blanco",
      "image": "/images/products/vaso-blanco.png",
      "color": "white",
      "border": true,
      "render3DURL": "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836705143.jpg&tipo=copo&id_cor_tampa=&time=1746836705143"
    },
    {
      "id": "negro",
      "name": "Negro",
      "image": "/images/products/vaso-negro.png",
      "color": "black",
      "border": false,
      "render3DURL": "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836569693.jpg&tipo=copo&id_cor_tampa=&time=1746836569693"
    }
  ]'::jsonb
WHERE id = 'vaso-ccc-plastico';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products"(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON "Products"(in_stock);
