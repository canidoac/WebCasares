-- Agregar el permiso manage_surveys a la tabla Role

-- Verificar si la columna ya existe antes de agregarla
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'Role' 
    AND column_name = 'manage_surveys'
  ) THEN
    ALTER TABLE "Role" ADD COLUMN manage_surveys BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Actualizar roles existentes
UPDATE "Role" 
SET manage_surveys = true 
WHERE name IN ('admin', 'super_admin');

COMMENT ON COLUMN "Role".manage_surveys IS 'Permiso para crear y gestionar encuestas';
