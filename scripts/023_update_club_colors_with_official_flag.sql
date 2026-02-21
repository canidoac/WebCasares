-- Agregar columna para diferenciar colores oficiales de personalizados
ALTER TABLE "ClubColors" 
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;

-- Marcar los colores del club como oficiales
UPDATE "ClubColors" 
SET is_official = true 
WHERE name IN ('Verde', 'Amarillo', 'Blanco', 'Negro', 'Azul');

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_club_colors_official ON "ClubColors" (is_official, display_order);

-- Comentario
COMMENT ON COLUMN "ClubColors".is_official IS 'TRUE para colores oficiales del club, FALSE para colores personalizados';
