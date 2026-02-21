-- Create table for Site Status configurations
-- This allows multiple status configurations that can be activated/deactivated

CREATE TABLE IF NOT EXISTS "SiteStatus" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status_type TEXT NOT NULL CHECK (status_type IN ('online', 'maintenance', 'coming_soon')),
  
  -- Coming Soon specific fields
  launch_date TIMESTAMPTZ,
  countdown_enabled BOOLEAN DEFAULT false,
  image_url TEXT,
  
  -- Maintenance specific fields
  maintenance_message TEXT,
  maintenance_image_url TEXT,
  
  -- General fields
  title TEXT,
  description TEXT,
  show_logo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT false
);

-- RLS Policies
ALTER TABLE "SiteStatus" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active site status"
  ON "SiteStatus" FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage site status"
  ON "SiteStatus" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role = 'admin'
    )
  );

-- Insert default online status
INSERT INTO "SiteStatus" (name, status_type, title, description, is_active)
VALUES ('Default Online', 'online', 'Bienvenido', 'Sitio en línea', true)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX idx_site_status_active ON "SiteStatus"(is_active) WHERE is_active = true;
