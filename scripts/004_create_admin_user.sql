-- Crear usuario administrador
-- Email: admin@clubccc.com
-- Password: Admin123!

-- Usar Pass en lugar de Password, y agregar ROL_NAME
INSERT INTO "User" (
  "Email",
  "Pass",
  "NOMBRE",
  "APELLIDO",
  "socio_number",
  "ROL_ID",
  "ROL_NAME"
) VALUES (
  'admin@clubccc.com',
  'Admin123!',
  'Admin',
  'Sistema',
  'CCC0000',
  '55',
  'Admin'
)
ON CONFLICT ("Email") DO NOTHING;
