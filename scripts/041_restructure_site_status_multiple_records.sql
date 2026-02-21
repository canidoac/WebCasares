-- Reestructurar SiteStatus para tener múltiples registros (uno por estado)
-- y SiteConfig para tener solo referencia al activo

-- 1. Eliminar constraint de registro único en SiteStatus
ALTER TABLE "SiteStatus" DROP CONSTRAINT IF EXISTS single_status;

-- 2. Cambiar id a SERIAL en lugar de forzarlo a 1
ALTER TABLE "SiteStatus" DROP CONSTRAINT IF EXISTS "SiteStatus_pkey";
ALTER TABLE "SiteStatus" ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS "SiteStatus_id_seq";
CREATE SEQUENCE "SiteStatus_id_seq";
ALTER TABLE "SiteStatus" ALTER COLUMN id SET DEFAULT nextval('"SiteStatus_id_seq"');
ALTER TABLE "SiteStatus" ADD PRIMARY KEY (id);

-- 3. Eliminar columna current_status (ahora estará en SiteConfig)
ALTER TABLE "SiteStatus" DROP COLUMN IF EXISTS current_status;

-- 4. Agregar columna status_key como identificador único
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS status_key TEXT;
UPDATE "SiteStatus" SET status_key = 'online' WHERE status_key IS NULL;
ALTER TABLE "SiteStatus" ALTER COLUMN status_key SET NOT NULL;
ALTER TABLE "SiteStatus" ADD CONSTRAINT unique_status_key UNIQUE (status_key);
ALTER TABLE "SiteStatus" ADD CONSTRAINT check_status_key CHECK (status_key IN ('online', 'maintenance', 'coming_soon'));

-- 5. Limpiar datos existentes
DELETE FROM "SiteStatus";

-- 6. Reiniciar secuencia
ALTER SEQUENCE "SiteStatus_id_seq" RESTART WITH 1;

-- 7. Insertar los 3 estados permanentes
INSERT INTO "SiteStatus" (status_key, title, message, media_type, show_countdown, status_color)
VALUES 
  -- Estado Online (sin configuración visual)
  ('online', 'Sitio Web Online', 'Funcionando correctamente', 'none', false, '#059669'),
  
  -- Estado Mantenimiento
  ('maintenance', 'Sitio en Mantenimiento', 'Estamos realizando mejoras. Solo la zona de administración está accesible.', 'none', false, '#d97706'),
  
  -- Estado Próximamente
  ('coming_soon', 'Próximamente', 'Estamos preparando algo especial para ti. ¡Vuelve pronto!', 'none', true, '#7c3aed');

-- 8. Agregar columna active_status_id a SiteConfig si no existe
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS active_status_id INTEGER;

-- 9. Crear foreign key constraint
ALTER TABLE "SiteConfig" DROP CONSTRAINT IF EXISTS fk_active_status;
ALTER TABLE "SiteConfig" ADD CONSTRAINT fk_active_status
  FOREIGN KEY (active_status_id) REFERENCES "SiteStatus"(id);

-- 10. Establecer el estado por defecto (online)
UPDATE "SiteConfig" 
SET active_status_id = (SELECT id FROM "SiteStatus" WHERE status_key = 'online')
WHERE active_status_id IS NULL;

-- 11. Hacer que active_status_id sea NOT NULL después de asignar valor
ALTER TABLE "SiteConfig" ALTER COLUMN active_status_id SET NOT NULL;

COMMENT ON TABLE "SiteStatus" IS 'Almacena todos los estados posibles del sitio (online, maintenance, coming_soon)';
COMMENT ON COLUMN "SiteStatus"."status_key" IS 'Identificador único del estado: online, maintenance, coming_soon';
COMMENT ON COLUMN "SiteConfig"."active_status_id" IS 'Referencia al estado activo del sitio en SiteStatus';
