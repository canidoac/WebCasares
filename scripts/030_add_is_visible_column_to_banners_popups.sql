-- Add is_visible column to SiteBanner and SitePopup tables to hide items from admin list
-- This allows having template items like "Default" that don't appear in the management UI

ALTER TABLE "SiteBanner"
ADD COLUMN IF NOT EXISTS "is_visible_in_list" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "SitePopup"
ADD COLUMN IF NOT EXISTS "is_visible_in_list" BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN "SiteBanner"."is_visible_in_list" IS 'Whether this banner should appear in the admin management list';
COMMENT ON COLUMN "SitePopup"."is_visible_in_list" IS 'Whether this popup should appear in the admin management list';
