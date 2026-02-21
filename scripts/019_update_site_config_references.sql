-- Update SiteConfig table to use references to the new tables
-- This makes the system more modular and allows multiple configurations

-- Add reference columns
ALTER TABLE "SiteConfig" 
  ADD COLUMN IF NOT EXISTS active_status_id UUID REFERENCES "SiteStatus"(id),
  ADD COLUMN IF NOT EXISTS active_banner_id UUID REFERENCES "SiteBanner"(id),
  ADD COLUMN IF NOT EXISTS active_popup_id UUID REFERENCES "SitePopup"(id);

-- Add enable/disable flags
ALTER TABLE "SiteConfig"
  ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS popup_enabled BOOLEAN DEFAULT false;

-- Migrate existing data if it exists
DO $$
DECLARE
  -- Cambiado de UUID a INTEGER para coincidir con el tipo de id de SiteConfig
  config_id INTEGER;
  new_status_id UUID;
  new_banner_id UUID;
  new_popup_id UUID;
BEGIN
  -- Get the config record
  SELECT id INTO config_id FROM "SiteConfig" LIMIT 1;
  
  IF config_id IS NOT NULL THEN
    -- Get default status
    SELECT id INTO new_status_id FROM "SiteStatus" WHERE is_active = true LIMIT 1;
    
    -- Migrate banner if header_banner_text exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'SiteConfig' AND column_name = 'header_banner_text'
    ) THEN
      INSERT INTO "SiteBanner" (
        name, message, bg_color_light, bg_color_dark, is_active
      )
      SELECT 
        'Migrated Banner',
        COALESCE(header_banner_text, 'Bienvenido'),
        COALESCE(header_banner_color, '#3b82f6'),
        COALESCE(banner_bg_color_dark, '#1e40af'),
        COALESCE(header_banner_enabled, false)
      FROM "SiteConfig"
      WHERE id = config_id AND header_banner_text IS NOT NULL
      RETURNING id INTO new_banner_id;
    END IF;
    
    -- Migrate popup if welcome_popup_enabled exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'SiteConfig' AND column_name = 'welcome_popup_enabled'
    ) THEN
      INSERT INTO "SitePopup" (
        name, title, message, image_url, opacity, is_active
      )
      SELECT 
        'Migrated Welcome Popup',
        COALESCE(welcome_popup_title, 'Bienvenido'),
        COALESCE(welcome_popup_content, 'Bienvenido al sitio'),
        welcome_popup_image,
        COALESCE(welcome_popup_opacity, 0.95),
        COALESCE(welcome_popup_enabled, false)
      FROM "SiteConfig"
      WHERE id = config_id
      RETURNING id INTO new_popup_id;
    END IF;
    
    -- Update SiteConfig with new references
    UPDATE "SiteConfig" 
    SET 
      active_status_id = new_status_id,
      active_banner_id = new_banner_id,
      active_popup_id = new_popup_id,
      banner_enabled = COALESCE(new_banner_id IS NOT NULL, false),
      popup_enabled = COALESCE(new_popup_id IS NOT NULL, false)
    WHERE id = config_id;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_config_status ON "SiteConfig"(active_status_id);
CREATE INDEX IF NOT EXISTS idx_site_config_banner ON "SiteConfig"(active_banner_id);
CREATE INDEX IF NOT EXISTS idx_site_config_popup ON "SiteConfig"(active_popup_id);

-- Add comment for documentation
COMMENT ON COLUMN "SiteConfig".active_status_id IS 'Reference to the active site status configuration';
COMMENT ON COLUMN "SiteConfig".active_banner_id IS 'Reference to the active banner to display';
COMMENT ON COLUMN "SiteConfig".active_popup_id IS 'Reference to the active popup to display';
