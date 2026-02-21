-- Fix RLS policies for SiteBanner table
-- This allows admins to manage banners while users can only view them based on targeting

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view banners targeted to them" ON "SiteBanner";
DROP POLICY IF EXISTS "Anyone can view active banners" ON "SiteBanner";

-- Drop the recursive function that causes stack depth issues
DROP FUNCTION IF EXISTS should_show_banner(UUID, UUID);
DROP FUNCTION IF EXISTS is_banner_visible_for_user(UUID, UUID);

-- Create simple, non-recursive policies

-- 1. SELECT policy: Users can view active banners (client-side will filter by audience)
CREATE POLICY "Users can view active banners"
  ON "SiteBanner" FOR SELECT
  TO public
  USING (is_active = true);

-- 2. INSERT policy: Only authenticated users with admin role (55) can create banners
CREATE POLICY "Admins can create banners"
  ON "SiteBanner" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE id = auth.uid()
      AND ("ID_ROL" = 55 OR "ROL_ID" = '55')
    )
  );

-- 3. UPDATE policy: Only authenticated users with admin role (55) can update banners
CREATE POLICY "Admins can update banners"
  ON "SiteBanner" FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE id = auth.uid()
      AND ("ID_ROL" = 55 OR "ROL_ID" = '55')
    )
  );

-- 4. DELETE policy: Only authenticated users with admin role (55) can delete banners
CREATE POLICY "Admins can delete banners"
  ON "SiteBanner" FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE id = auth.uid()
      AND ("ID_ROL" = 55 OR "ROL_ID" = '55')
    )
  );

-- Create a simple SQL function to get the highest priority banner for a user
-- This function is meant to be called from application code, not from RLS policies
CREATE OR REPLACE FUNCTION get_banner_for_user(
  p_user_id UUID DEFAULT NULL,
  p_user_role INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  message TEXT,
  link_url TEXT,
  link_text TEXT,
  show_button BOOLEAN,
  button_text TEXT,
  bg_color_light TEXT,
  bg_color_dark TEXT,
  text_color_light TEXT,
  text_color_dark TEXT,
  button_bg_color_light TEXT,
  button_bg_color_dark TEXT,
  button_text_color_light TEXT,
  button_text_color_dark TEXT,
  target_audience TEXT,
  target_roles INTEGER[],
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.message,
    b.link_url,
    b.link_text,
    b.show_button,
    b.button_text,
    b.bg_color_light,
    b.bg_color_dark,
    b.text_color_light,
    b.text_color_dark,
    b.button_bg_color_light,
    b.button_bg_color_dark,
    b.button_text_color_light,
    b.button_text_color_dark,
    b.target_audience,
    b.target_roles,
    b.priority
  FROM "SiteBanner" b
  WHERE b.is_active = true
    AND (b.start_date IS NULL OR b.start_date <= NOW())
    AND (b.end_date IS NULL OR b.end_date >= NOW())
    AND (
      -- Show to all
      b.target_audience = 'all'
      -- Show to guests only
      OR (b.target_audience = 'guests' AND p_user_id IS NULL)
      -- Show to authenticated users
      OR (b.target_audience = 'authenticated' AND p_user_id IS NOT NULL)
      -- Show to specific roles
      OR (b.target_audience = 'roles' AND p_user_role = ANY(b.target_roles))
    )
  ORDER BY b.priority DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_banner_for_user IS 'Returns the highest priority banner visible to a given user based on their role and authentication status';
