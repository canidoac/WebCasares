-- Create table for Site Banners (top announcement bar)
-- This allows multiple banners that can be scheduled and activated

CREATE TABLE IF NOT EXISTS "SiteBanner" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  
  -- Banner content
  message TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  
  -- Styling
  bg_color_light TEXT DEFAULT '#3b82f6',
  bg_color_dark TEXT DEFAULT '#1e40af',
  text_color_light TEXT DEFAULT '#ffffff',
  text_color_dark TEXT DEFAULT '#ffffff',
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Display settings
  is_active BOOLEAN DEFAULT false,
  is_dismissible BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority shows first
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE "SiteBanner" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON "SiteBanner" FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "Admins can manage banners"
  ON "SiteBanner" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_site_banner_active ON "SiteBanner"(is_active, priority DESC) 
  WHERE is_active = true;
CREATE INDEX idx_site_banner_dates ON "SiteBanner"(start_date, end_date);
