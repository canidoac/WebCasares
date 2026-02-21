-- Crear tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS "SiteConfig" (
  id INTEGER PRIMARY KEY DEFAULT 1,
  show_header_banner BOOLEAN DEFAULT false,
  header_banner_text TEXT,
  header_banner_link TEXT,
  header_banner_color TEXT DEFAULT '#10b981',
  show_popup BOOLEAN DEFAULT false,
  popup_title TEXT,
  popup_content TEXT,
  popup_image TEXT,
  popup_button_text TEXT,
  popup_button_link TEXT,
  enable_registration BOOLEAN DEFAULT true,
  navbar_logo_url TEXT DEFAULT '/images/logo-club.png',
  navbar_items JSONB DEFAULT '[
    {"label": "Inicio", "href": "/", "status": "visible"},
    {"label": "Tienda", "href": "/tienda", "status": "visible", "icon": "ShoppingBag"},
    {"label": "Club", "href": "/club", "status": "coming_soon", "icon": "Users"}
  ]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_config CHECK (id = 1)
);

-- Insertar configuración por defecto
INSERT INTO "SiteConfig" (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
