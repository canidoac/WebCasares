-- Limpiar columnas innecesarias de SiteConfig (banner y popup ya están en sus tablas propias)

-- Eliminar columnas relacionadas con banner (ahora en SiteBanners)
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS show_header_banner;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS header_banner_text;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS header_banner_link;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS header_banner_color;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS header_banner_text_color;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS header_banner_color_dark;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS header_banner_text_color_dark;

-- Eliminar columnas relacionadas con popup (ahora en SitePopups)
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS show_popup;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS popup_title;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS popup_content;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS popup_image;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS popup_button_text;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS popup_button_link;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS popup_opacity;

-- Eliminar columnas de navbar (ahora en NavbarItems)
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS navbar_logo_url;
ALTER TABLE "SiteConfig" DROP COLUMN IF EXISTS navbar_items;

COMMENT ON TABLE "SiteConfig" IS 'Configuración general del sitio (registro, estado del sitio, y modo mantenimiento/proximamente)';
