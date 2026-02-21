-- Agrega columna icon a NavbarItems para permitir seleccionar iconos en el menú
ALTER TABLE "NavbarItems"
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN "NavbarItems".icon IS 'Nombre del icono de Lucide React a mostrar junto al item';
