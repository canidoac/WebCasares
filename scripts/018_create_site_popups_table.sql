-- Create table for Site Popups (welcome popups, announcements, etc)
-- This allows multiple popups that can be scheduled and targeted

CREATE TABLE IF NOT EXISTS "SitePopup" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  
  -- Popup content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  button_text TEXT DEFAULT 'Entendido',
  button_link TEXT,
  
  -- Display settings
  display_type TEXT DEFAULT 'once' CHECK (display_type IN ('once', 'daily', 'always', 'session')),
  delay_seconds INTEGER DEFAULT 1,
  opacity REAL DEFAULT 0.95 CHECK (opacity >= 0 AND opacity <= 1),
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Targeting
  show_for_guests BOOLEAN DEFAULT true,
  show_for_users BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE "SitePopup" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active popups"
  ON "SitePopup" FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "Admins can manage popups"
  ON "SitePopup" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()
      AND "User".role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_site_popup_active ON "SitePopup"(is_active, priority DESC) 
  WHERE is_active = true;
CREATE INDEX idx_site_popup_dates ON "SitePopup"(start_date, end_date);
