-- Create SitePages table for available routes in the site
CREATE TABLE IF NOT EXISTS "SitePages" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'main' CHECK (category IN ('main', 'admin', 'auth', 'profile', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert existing pages
INSERT INTO "SitePages" (name, path, description, category, is_active) VALUES
  ('Inicio', '/', 'Página principal del sitio', 'main', true),
  ('Tienda', '/tienda', 'Tienda de productos', 'main', true),
  ('Club', '/club', 'Página del club', 'main', true),
  ('Perfil', '/perfil', 'Perfil de usuario', 'profile', true),
  ('Login', '/login', 'Iniciar sesión', 'auth', true),
  ('Registro', '/register', 'Crear cuenta nueva', 'auth', true),
  ('Olvidaste Contraseña', '/olvidaste-contrasena', 'Recuperar contraseña', 'auth', true),
  ('Restablecer Contraseña', '/restablecer-contrasena', 'Restablecer contraseña', 'auth', true),
  ('Verificar Email', '/verificar-email', 'Verificar correo electrónico', 'auth', true),
  ('Admin - Panel', '/admin', 'Panel de administración', 'admin', true),
  ('Admin - Configuración', '/admin/configuracion', 'Configuración del sitio', 'admin', true),
  ('Admin - Noticias', '/admin/noticias', 'Gestión de noticias', 'admin', true),
  ('Admin - Nueva Noticia', '/admin/noticias/nueva', 'Crear nueva noticia', 'admin', true),
  ('Admin - Migraciones', '/admin/migraciones', 'Migraciones de base de datos', 'admin', true)
ON CONFLICT (path) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_site_pages_category ON "SitePages"(category);
CREATE INDEX IF NOT EXISTS idx_site_pages_active ON "SitePages"(is_active);
