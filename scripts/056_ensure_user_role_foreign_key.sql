-- Asegurar que existe la foreign key entre User y SiteRole
-- Este script es idempotente y puede ejecutarse múltiples veces

-- Primero verificar si la constraint ya existe y eliminarla si está mal configurada
DO $$ 
BEGIN
  -- Eliminar constraint antigua si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_role_fk' 
    AND table_name = 'User'
  ) THEN
    ALTER TABLE "User" DROP CONSTRAINT user_role_fk;
  END IF;
END $$;

-- Crear la foreign key constraint
ALTER TABLE "User" 
ADD CONSTRAINT user_role_fk 
FOREIGN KEY ("ID_ROL") REFERENCES "SiteRole"(id)
ON DELETE SET DEFAULT
ON UPDATE CASCADE;

-- Crear índice para mejorar performance de joins
CREATE INDEX IF NOT EXISTS idx_user_id_rol ON "User"("ID_ROL");

-- Verificar que todos los usuarios tienen un rol válido
-- Si un usuario tiene un rol que no existe, establecerlo a 1 (socio)
UPDATE "User" 
SET "ID_ROL" = 1 
WHERE "ID_ROL" NOT IN (SELECT id FROM "SiteRole");

COMMENT ON CONSTRAINT user_role_fk ON "User" IS 'Foreign key que relaciona usuarios con sus roles del sistema';
