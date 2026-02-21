-- Update SiteBanner table to support audience targeting
-- This allows banners to be shown to specific user segments

-- Add audience targeting columns
ALTER TABLE "SiteBanner" 
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all' 
  CHECK (target_audience IN ('all', 'guests', 'authenticated', 'roles'));

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS target_roles INTEGER[] DEFAULT NULL;

-- Add button configuration
ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS show_button BOOLEAN DEFAULT false;

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Ir';

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS button_bg_color_light TEXT DEFAULT '#2e8b58';

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS button_bg_color_dark TEXT DEFAULT '#2e8b58';

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS button_text_color_light TEXT DEFAULT '#ffffff';

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS button_text_color_dark TEXT DEFAULT '#ffffff';

-- Create helper function to check if banner should be shown to user
CREATE OR REPLACE FUNCTION should_show_banner(
  banner_id UUID,
  user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  banner_record RECORD;
  user_role INTEGER;
BEGIN
  -- Get banner details
  SELECT * INTO banner_record
  FROM "SiteBanner"
  WHERE id = banner_id;
  
  -- Check if banner is active and within date range
  IF NOT banner_record.is_active THEN
    RETURN false;
  END IF;
  
  IF banner_record.start_date IS NOT NULL AND banner_record.start_date > NOW() THEN
    RETURN false;
  END IF;
  
  IF banner_record.end_date IS NOT NULL AND banner_record.end_date < NOW() THEN
    RETURN false;
  END IF;
  
  -- Check audience targeting
  CASE banner_record.target_audience
    WHEN 'all' THEN
      RETURN true;
    WHEN 'guests' THEN
      RETURN user_id IS NULL;
    WHEN 'authenticated' THEN
      RETURN user_id IS NOT NULL;
    WHEN 'roles' THEN
      IF user_id IS NULL THEN
        RETURN false;
      END IF;
      
      -- Get user's role
      SELECT "ID_ROL" INTO user_role
      FROM "User"
      WHERE id = user_id;
      
      -- Check if user's role is in target_roles array
      RETURN user_role = ANY(banner_record.target_roles);
  END CASE;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to use audience targeting
DROP POLICY IF EXISTS "Anyone can view active banners" ON "SiteBanner";

CREATE POLICY "Users can view banners targeted to them"
  ON "SiteBanner" FOR SELECT
  TO public
  USING (
    should_show_banner(id, auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_site_banner_audience ON "SiteBanner"(target_audience);
CREATE INDEX idx_site_banner_roles ON "SiteBanner" USING GIN(target_roles);

-- Insert example banners for different audiences
INSERT INTO "SiteBanner" (name, message, link_url, link_text, show_button, target_audience, is_active, priority) VALUES
('Banner Invitados', 'Únete al Club Carlos Casares! Regístrate ahora y disfruta de todos los beneficios.', '/register', 'Registrarse', true, 'guests', true, 100),
('Banner Socios', 'Bienvenido de nuevo! Revisa las últimas noticias del club.', '/noticias', 'Ver Noticias', true, 'authenticated', false, 90)
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN "SiteBanner".target_audience IS 'Who can see this banner: all, guests, authenticated, or roles';
COMMENT ON COLUMN "SiteBanner".target_roles IS 'Array of role IDs that can see this banner (only used when target_audience=roles)';
