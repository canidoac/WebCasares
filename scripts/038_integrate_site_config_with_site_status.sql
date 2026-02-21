-- =====================================================
-- Script 038: Integrar SiteConfig con SiteStatus
-- =====================================================
-- Descripción: 
-- - Elimina columnas redundantes de SiteConfig
-- - Agrega columna active_status_id para referenciar el estado activo
-- - Inserta 3 registros permanentes en SiteStatus (online, maintenance, coming_soon)
-- - Configura SiteConfig para usar el estado 'online' por defecto
-- =====================================================

-- 1. Eliminar columnas de estado de SiteConfig (ahora viven en SiteStatus)
ALTER TABLE "SiteConfig" 
  DROP COLUMN IF EXISTS site_status,
  DROP COLUMN IF EXISTS coming_soon_title,
  DROP COLUMN IF EXISTS coming_soon_message,
  DROP COLUMN IF EXISTS coming_soon_image,
  DROP COLUMN IF EXISTS coming_soon_launch_date,
  DROP COLUMN IF EXISTS maintenance_mode;

-- 2. Agregar columna de referencia al estado activo
ALTER TABLE "SiteConfig" 
  ADD COLUMN IF NOT EXISTS active_status_id INTEGER REFERENCES "SiteStatus"(id);

-- 3. Insertar los 3 estados permanentes en SiteStatus
-- Primero verificamos si ya existen registros
DO $$
BEGIN
  -- Solo insertar si la tabla está vacía
  IF NOT EXISTS (SELECT 1 FROM "SiteStatus" LIMIT 1) THEN
    
    -- Estado ONLINE: No necesita ninguna configuración
    INSERT INTO "SiteStatus" (
      status_type,
      title,
      message,
      media_url,
      media_type,
      show_countdown,
      countdown_target,
      video_autoplay,
      video_muted,
      excluded_pages
    ) VALUES 
      (
        'online',
        NULL,
        NULL,
        NULL,
        NULL,
        false,
        NULL,
        false,
        false,
        ARRAY[]::text[]
      ),
      
      -- Estado MAINTENANCE: Muestra en todas las páginas excepto /admin/login
      (
        'maintenance',
        'Sitio en Mantenimiento',
        'Estamos realizando mejoras en nuestro sitio. Vuelve pronto.',
        NULL,
        NULL,
        false,
        NULL,
        false,
        false,
        ARRAY['/admin/login', '/admin/configuracion']::text[]
      ),
      
      -- Estado COMING SOON: Muestra en todas las páginas excepto /login, siempre con countdown
      (
        'coming_soon',
        'Próximamente',
        'Estamos preparando algo increíble para ti. ¡Mantente atento!',
        NULL,
        NULL,
        true,
        NOW() + INTERVAL '30 days', -- Countdown por defecto a 30 días
        false,
        false,
        ARRAY['/login', '/register']::text[]
      );
      
  END IF;
END $$;

-- 4. Configurar SiteConfig para usar el estado 'online' por defecto
UPDATE "SiteConfig" 
SET active_status_id = (SELECT id FROM "SiteStatus" WHERE status_type = 'online' LIMIT 1)
WHERE active_status_id IS NULL;

-- 5. Agregar constraint para asegurar que active_status_id no sea null
ALTER TABLE "SiteConfig" 
  ALTER COLUMN active_status_id SET NOT NULL;

-- 6. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_site_config_active_status 
  ON "SiteConfig"(active_status_id);

-- 7. Agregar comentarios para documentación
COMMENT ON COLUMN "SiteConfig".active_status_id IS 'ID del estado activo actual del sitio (referencia a SiteStatus)';
COMMENT ON TABLE "SiteStatus" IS 'Contiene 3 registros permanentes (online, maintenance, coming_soon) con sus configuraciones específicas';
