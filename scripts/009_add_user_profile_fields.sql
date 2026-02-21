-- Agregar campos de perfil a la tabla User
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "photo_url" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "member_category" VARCHAR(50) DEFAULT 'Socio',
ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Actualizar usuarios existentes para que tengan una categoría
UPDATE "User" 
SET "member_category" = CASE 
  WHEN "ID_ROL" = 55 THEN 'Socio Fundador'
  ELSE 'Socio'
END
WHERE "member_category" IS NULL;
