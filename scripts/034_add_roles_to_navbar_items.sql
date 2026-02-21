-- Add allowed_roles column to NavbarItems table
ALTER TABLE "NavbarItems" 
ADD COLUMN IF NOT EXISTS allowed_roles INTEGER[] DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN "NavbarItems".allowed_roles IS 'Array of role IDs that can see this item. NULL means visible based on visibility setting only';

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_navbar_items_roles ON "NavbarItems" USING GIN(allowed_roles);
