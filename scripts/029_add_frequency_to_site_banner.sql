-- Add frequency column to SiteBanner to control display frequency
-- Similar to SitePopup's display_type

ALTER TABLE "SiteBanner" 
ADD COLUMN frequency TEXT DEFAULT 'always' 
CHECK (frequency IN ('once', 'daily', 'always', 'session'));

-- Create index for efficient querying
CREATE INDEX idx_site_banner_frequency ON "SiteBanner"(frequency) WHERE is_active = true;

-- Add comment
COMMENT ON COLUMN "SiteBanner".frequency IS 'Controls how often the banner is shown: once (one time ever), daily (once per day), always (every visit), session (once per session)';
