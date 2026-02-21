-- Reorganizar SiteStatus para tener columnas específicas por estado

-- Eliminar la tabla SiteStatus antigua
DROP TABLE IF EXISTS "SiteStatus";

-- Crear tabla SiteStatus reorganizada con columnas específicas por estado
CREATE TABLE IF NOT EXISTS "SiteStatus" (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_status TEXT NOT NULL DEFAULT 'online' CHECK (current_status IN ('online', 'maintenance', 'coming_soon')),
  
  -- === MAINTENANCE MODE COLUMNS ===
  -- Excluye todas las páginas excepto /admin/login
  maintenance_title TEXT DEFAULT 'Sitio en Mantenimiento',
  maintenance_message TEXT DEFAULT 'Estamos trabajando para mejorar tu experiencia. Vuelve pronto.',
  maintenance_media_type TEXT DEFAULT 'none' CHECK (maintenance_media_type IN ('none', 'image', 'video')),
  maintenance_media_url TEXT, -- Blob: Config_Site/Status_Site/
  maintenance_show_countdown BOOLEAN DEFAULT false,
  maintenance_launch_date TIMESTAMPTZ,
  
  -- === COMING SOON MODE COLUMNS ===
  -- Excluye solo /login
  coming_soon_title TEXT DEFAULT 'Próximamente',
  coming_soon_message TEXT DEFAULT 'Estamos preparando algo especial para ti. ¡Vuelve pronto!',
  coming_soon_media_type TEXT DEFAULT 'none' CHECK (coming_soon_media_type IN ('none', 'image', 'video')),
  coming_soon_media_url TEXT, -- Blob: Config_Site/Status_Site/
  coming_soon_launch_date TIMESTAMPTZ, -- Siempre muestra countdown
  
  -- === ONLINE MODE ===
  -- No tiene columnas específicas, el sitio funciona normalmente
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_status CHECK (id = 1)
);

-- Insertar registro por defecto
INSERT INTO "SiteStatus" (id, current_status) VALUES (1, 'online')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE "SiteStatus" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site status"
  ON "SiteStatus" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage site status"
  ON "SiteStatus" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User"."ROL_ID"::text IN (
        SELECT id::text FROM "SiteRoles" WHERE name = 'Admin'
      )
    )
  );

COMMENT ON TABLE "SiteStatus" IS 'Estado actual del sitio con configuraciones específicas para cada modo';
COMMENT ON COLUMN "SiteStatus".current_status IS 'online: sitio normal | maintenance: solo /admin/login accesible | coming_soon: todas menos /login con countdown';
COMMENT ON COLUMN "SiteStatus".maintenance_media_url IS 'URL de imagen/video almacenado en Blob: Config_Site/Status_Site/';
COMMENT ON COLUMN "SiteStatus".coming_soon_media_url IS 'URL de imagen/video almacenado en Blob: Config_Site/Status_Site/';
