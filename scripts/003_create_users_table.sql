-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "Pass" VARCHAR(255) NOT NULL,
  "NOMBRE" VARCHAR(100) NOT NULL,
  "APELLIDO" VARCHAR(100) NOT NULL,
  -- Added socio_number field with unique constraint
  "socio_number" VARCHAR(20) UNIQUE NOT NULL,
  -- Changed default role to 1 (normal user), 55 will be admin
  "ID_ROL" INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("Email");

-- Added index for socio_number lookups
CREATE INDEX IF NOT EXISTS idx_user_socio_number ON "User"("socio_number");

-- Insertar un usuario admin de prueba (contraseña: admin123)
-- Added admin user with role 55 and socio number
INSERT INTO "User" ("Email", "Pass", "NOMBRE", "APELLIDO", "socio_number", "ID_ROL")
VALUES ('admin@clubcasares.com', 'admin123', 'Admin', 'Club', 'CCC0001', 55)
ON CONFLICT ("Email") DO NOTHING;
