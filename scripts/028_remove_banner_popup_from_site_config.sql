-- Remove banner and popup columns from SiteConfig table
-- Cleaning up SiteConfig by removing banner and popup columns now managed in separate tables

ALTER TABLE "SiteConfig"
  DROP COLUMN IF EXISTS show_header_banner,
  DROP COLUMN IF EXISTS header_banner_text,
  DROP COLUMN IF EXISTS header_banner_button_text,
  DROP COLUMN IF EXISTS header_banner_link,
  DROP COLUMN IF EXISTS header_banner_show_button,
  DROP COLUMN IF EXISTS header_banner_color,
  DROP COLUMN IF EXISTS header_banner_text_color,
  DROP COLUMN IF EXISTS header_banner_bg_color,
  DROP COLUMN IF EXISTS header_banner_color_dark,
  DROP COLUMN IF EXISTS header_banner_text_color_dark,
  DROP COLUMN IF EXISTS header_banner_button_color,
  DROP COLUMN IF EXISTS header_banner_button_color_dark,
  DROP COLUMN IF EXISTS header_banner_button_text_color,
  DROP COLUMN IF EXISTS header_banner_button_text_color_dark,
  DROP COLUMN IF EXISTS show_popup,
  DROP COLUMN IF EXISTS popup_title,
  DROP COLUMN IF EXISTS popup_content,
  DROP COLUMN IF EXISTS popup_image,
  DROP COLUMN IF EXISTS popup_button_text,
  DROP COLUMN IF EXISTS popup_button_link,
  DROP COLUMN IF EXISTS popup_opacity,
  DROP COLUMN IF EXISTS active_banner_id,
  DROP COLUMN IF EXISTS active_popup_id;

-- Add comment
COMMENT ON TABLE "SiteConfig" IS 'Global site configuration. Banner and Popup configurations are now managed in SiteBanner and SitePopup tables respectively.';
