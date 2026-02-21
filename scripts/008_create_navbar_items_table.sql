-- Create NavbarItems table for navigation configuration
CREATE TABLE IF NOT EXISTS "NavbarItems" (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'coming_soon')),
  visibility TEXT NOT NULL DEFAULT 'all' CHECK (visibility IN ('all', 'logged_in', 'logged_out')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_protected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default navigation items
INSERT INTO "NavbarItems" (label, href, status, visibility, display_order, is_protected) VALUES
  ('Inicio', '/', 'visible', 'all', 1, true),
  ('Tienda', '/tienda', 'visible', 'all', 2, false),
  ('Club', '/club', 'coming_soon', 'all', 3, false)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_navbar_items_order ON "NavbarItems"(display_order);
CREATE INDEX IF NOT EXISTS idx_navbar_items_status ON "NavbarItems"(status);
