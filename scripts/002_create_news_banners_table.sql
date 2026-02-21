-- Crear tabla de noticias/banners
CREATE TABLE IF NOT EXISTS "News" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  action_text TEXT,
  action_url TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar las noticias/banners existentes
INSERT INTO "News" (title, description, image_url, action_text, action_url, active, display_order) VALUES
('Bienvenido al Club Carlos Casares', 'En capital Federal desde el interior de la provincia de Buenos Aires', '/images/equipo-capital.png', NULL, NULL, true, 1),
('¡Únete a nuestro grupo de WhatsApp!', 'Recibe todas las noticias y novedades del club directamente en tu teléfono', '/images/whatsapp-group.png', 'Unirse al grupo', 'https://chat.whatsapp.com/KHLocslWDalL8BwtWL67Gf', true, 2)
ON CONFLICT DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_news_active ON "News"(active);
CREATE INDEX IF NOT EXISTS idx_news_display_order ON "News"(display_order);
CREATE INDEX IF NOT EXISTS idx_news_expires_at ON "News"(expires_at);
