-- Agregar slug a la tabla SitePages si no existe
ALTER TABLE "SitePages" ADD COLUMN IF NOT EXISTS slug TEXT;

-- Actualizar registros existentes con slugs basados en el path
UPDATE "SitePages" SET slug = 'inicio' WHERE path = '/' AND slug IS NULL;
UPDATE "SitePages" SET slug = 'tienda' WHERE path = '/tienda' AND slug IS NULL;
UPDATE "SitePages" SET slug = 'club' WHERE path = '/club' AND slug IS NULL;
UPDATE "SitePages" SET slug = 'login' WHERE path = '/login' AND slug IS NULL;
UPDATE "SitePages" SET slug = 'register' WHERE path = '/register' AND slug IS NULL;

-- Insertar nuevas páginas con las columnas correctas de la tabla
INSERT INTO "SitePages" (name, path, description, category, slug, is_active) VALUES
('Disciplinas', '/disciplinas', 'Nuestras disciplinas deportivas', 'main', 'disciplinas', true),
('Noticias', '/noticias', 'Todas las noticias del club', 'main', 'noticias', true),
('Admin - Club', '/admin/club', 'Gestión de información del club', 'admin', 'admin-club', true),
('Admin - Disciplinas', '/admin/disciplinas', 'Gestión de disciplinas deportivas', 'admin', 'admin-disciplinas', true),
('Admin - Usuarios', '/admin/usuarios', 'Gestión de usuarios', 'admin', 'admin-usuarios', true)
ON CONFLICT (path) DO NOTHING;

-- Crear índice único en slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_pages_slug ON "SitePages"(slug);
