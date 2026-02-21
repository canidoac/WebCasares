-- Update SitePopup table to support role-based targeting similar to SiteBanner
-- Adding role-based targeting and priority system for popups

ALTER TABLE "SitePopup" 
  DROP COLUMN IF EXISTS show_for_guests,
  DROP COLUMN IF EXISTS show_for_users,
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'guests', 'authenticated', 'roles')),
  ADD COLUMN IF NOT EXISTS target_roles INTEGER[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_button BOOLEAN DEFAULT true;

-- Update RLS policies for proper admin access
DROP POLICY IF EXISTS "Admins can manage popups" ON "SitePopup";

CREATE POLICY "Admins can manage popups"
  ON "SitePopup" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = auth.uid()::text
      AND "User"."ID_ROL" = 55
    )
  );

-- Function to get popup for user based on role and authentication
CREATE OR REPLACE FUNCTION get_popup_for_user(user_id TEXT DEFAULT NULL, user_role_id INTEGER DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  title TEXT,
  message TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  has_button BOOLEAN,
  opacity REAL,
  display_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.title,
    p.message,
    p.image_url,
    p.button_text,
    p.button_link,
    p.has_button,
    p.opacity,
    p.display_type
  FROM "SitePopup" p
  WHERE p.is_active = true
    AND (p.start_date IS NULL OR p.start_date <= NOW())
    AND (p.end_date IS NULL OR p.end_date >= NOW())
    AND (
      p.target_audience = 'all'
      OR (p.target_audience = 'guests' AND user_id IS NULL)
      OR (p.target_audience = 'authenticated' AND user_id IS NOT NULL)
      OR (p.target_audience = 'roles' AND user_role_id = ANY(p.target_roles))
    )
  ORDER BY p.priority DESC, p.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
