-- Agregar columna display_name a la tabla User
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(200);

-- Crear índice para búsquedas rápidas por display_name
CREATE INDEX IF NOT EXISTS idx_user_display_name ON "User"(display_name);

-- Actualizar usuarios existentes con un display_name basado en nombre y apellido
UPDATE "User" 
SET display_name = "NOMBRE" || ' ' || "APELLIDO"
WHERE display_name IS NULL;
