-- =============================================================================
-- CLUB CARLOS CASARES - SCRIPT COMPLETO DE BASE DE DATOS
-- =============================================================================
-- Este script crea todas las tablas necesarias e inserta la data inicial
-- Ejecutar en una base de datos de Supabase nueva/vacia
-- =============================================================================

-- =============================================
-- 1. TABLA DE ROLES DEL SISTEMA
-- =============================================
CREATE TABLE IF NOT EXISTS "SiteRole" (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  permissions JSONB DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar roles del sistema
INSERT INTO "SiteRole" (id, name, display_name, description, color, permissions, is_system_role) VALUES
(1, 'socio', 'Socio', 'Miembro basico del club sin acceso al panel de administracion', '#10b981', '{
  "panel_admin": false,
  "view_news": true,
  "view_store": true,
  "manage_own_profile": true
}', true),
(55, 'admin', 'Admin', 'Administrador con acceso completo a todas las funciones', '#ef4444', '{
  "panel_admin": true,
  "manage_news": true,
  "manage_store": true,
  "manage_users": true,
  "manage_site_config": true,
  "manage_banners": true,
  "manage_popups": true,
  "manage_roles": true,
  "manage_surveys": true,
  "view_analytics": true,
  "manage_colors": true
}', true),
(56, 'dev', 'Desarrollador', 'Desarrollador con acceso limitado a configuracion del sitio', '#8b5cf6', '{
  "panel_admin": true,
  "manage_news": true,
  "manage_site_config": true,
  "manage_surveys": true,
  "view_analytics": true,
  "manage_own_profile": true
}', true)
ON CONFLICT (id) DO NOTHING;

-- Funcion para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(user_role_id INTEGER, permission_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_permissions JSONB;
  result BOOLEAN;
BEGIN
  SELECT permissions INTO role_permissions FROM "SiteRole" WHERE id = user_role_id;
  IF role_permissions IS NULL THEN RETURN false; END IF;
  result := (role_permissions #>> string_to_array(permission_path, '.'))::BOOLEAN;
  RETURN COALESCE(result, false);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. TABLA DE USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "Pass" VARCHAR(255) NOT NULL,
  "NOMBRE" VARCHAR(100) NOT NULL,
  "APELLIDO" VARCHAR(100) NOT NULL,
  "socio_number" VARCHAR(20) UNIQUE NOT NULL,
  "ID_ROL" INTEGER DEFAULT 1 REFERENCES "SiteRole"(id),
  photo_url VARCHAR(500),
  member_category VARCHAR(50) DEFAULT 'Socio',
  bio TEXT,
  birth_date DATE,
  phone VARCHAR(50),
  registration_date DATE DEFAULT CURRENT_DATE,
  display_name VARCHAR(100),
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("Email");
CREATE INDEX IF NOT EXISTS idx_user_socio_number ON "User"("socio_number");
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"("ID_ROL");

-- Usuario admin inicial (contrasena: admin123 - CAMBIAR EN PRODUCCION)
INSERT INTO "User" ("Email", "Pass", "NOMBRE", "APELLIDO", "socio_number", "ID_ROL", member_category)
VALUES ('admin@clubcasares.com', '$2b$10$QwKHi7OZ1ZRFyxqgmwNDFOGnNWrVBWVgxVxQxQxQxQxQxQxQxQxQx', 'Admin', 'Club', 'CCC0001', 55, 'Socio Fundador')
ON CONFLICT ("Email") DO NOTHING;

-- =============================================
-- 3. TABLA DE ESTADOS DEL SITIO
-- =============================================
CREATE TABLE IF NOT EXISTS "SiteStatus" (
  id SERIAL PRIMARY KEY,
  status_key TEXT NOT NULL UNIQUE CHECK (status_key IN ('online', 'maintenance', 'coming_soon')),
  title TEXT NOT NULL,
  message TEXT,
  media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video')),
  media_url TEXT,
  show_countdown BOOLEAN DEFAULT false,
  launch_date TIMESTAMPTZ,
  status_color TEXT DEFAULT '#059669',
  allow_admin_access BOOLEAN DEFAULT true,
  allow_login BOOLEAN DEFAULT false,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los 3 estados del sitio
INSERT INTO "SiteStatus" (status_key, title, message, media_type, show_countdown, status_color, allow_admin_access, allow_login) VALUES 
('online', 'Sitio Web Online', 'Funcionando correctamente', 'none', false, '#059669', true, true),
('maintenance', 'Sitio en Mantenimiento', 'Estamos realizando mejoras. Solo la zona de administracion esta accesible.', 'none', false, '#d97706', true, false),
('coming_soon', 'Proximamente', 'Estamos preparando algo especial para ti. Vuelve pronto!', 'none', true, '#7c3aed', true, false)
ON CONFLICT (status_key) DO NOTHING;

-- =============================================
-- 4. TABLA DE CONFIGURACION DEL SITIO
-- =============================================
CREATE TABLE IF NOT EXISTS "SiteConfig" (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active_status_id INTEGER NOT NULL DEFAULT 1 REFERENCES "SiteStatus"(id),
  show_header_banner BOOLEAN DEFAULT false,
  show_popup BOOLEAN DEFAULT false,
  enable_registration BOOLEAN DEFAULT true,
  navbar_logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuracion inicial
INSERT INTO "SiteConfig" (id, active_status_id, show_header_banner, show_popup, enable_registration) 
VALUES (1, 1, false, false, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. TABLA DE ITEMS DE NAVEGACION
-- =============================================
CREATE TABLE IF NOT EXISTS "NavbarItems" (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'coming_soon')),
  visibility TEXT NOT NULL DEFAULT 'all' CHECK (visibility IN ('all', 'logged_in', 'logged_out')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_protected BOOLEAN DEFAULT false,
  icon TEXT,
  roles JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "NavbarItems" (label, href, status, visibility, display_order, is_protected, icon) VALUES
('Inicio', '/', 'visible', 'all', 1, true, 'Home'),
('Noticias', '/noticias', 'visible', 'all', 2, false, 'Newspaper'),
('Club', '/club', 'visible', 'all', 3, false, 'Users'),
('Tienda', '/tienda', 'visible', 'all', 4, false, 'ShoppingBag'),
('Disciplinas', '/disciplinas', 'visible', 'all', 5, false, 'Trophy')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_navbar_items_order ON "NavbarItems"(display_order);

-- =============================================
-- 6. TABLA DE PRODUCTOS
-- =============================================
CREATE TABLE IF NOT EXISTS "Products" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_front TEXT NOT NULL,
  image_back TEXT,
  badge TEXT,
  description TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  is_3d BOOLEAN DEFAULT false,
  render_3d_url TEXT,
  variants JSONB,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "Products" (id, name, price, image_front, image_back, badge, description, in_stock, category) VALUES
('camiseta-gris-f11-2025', 'Camiseta Gris F11 2025', 22000, '/images/products/camiseta-gris-frente.png', '/images/products/camiseta-gris-dorso.png', 'Nueva', 'Nueva Camiseta oficial de F11 para la temporada 2025.', true, 'camisetas'),
('camiseta-f5-femenino-2025', 'Camiseta F5 Femenino 2025', 22000, '/images/products/camiseta-f5-femenino-frente.png', '/images/products/camiseta-f5-femenino-dorso.png', 'Nueva', 'Camiseta oficial del equipo femenino del Club para la temporada 2025.', true, 'camisetas'),
('camiseta-roja-aviador', 'Camiseta Arquero Malatini', 22000, '/images/products/camiseta-roja-frente.png', '/images/products/camiseta-roja-dorso.png', 'Edicion Especial', 'Camiseta de arquero en homenaje al Piloto Jorge Malatini.', true, 'camisetas'),
('camiseta-arquero-mouras-amarilla', 'Camiseta Arquero Mouras Amarilla', 22000, '/images/products/camiseta-amarilla-frente.png', '/images/products/camiseta-amarilla-dorso.png', 'Edicion Especial', 'Camiseta de arquero en homenaje a Roberto Mouras.', true, 'camisetas'),
('camiseta-negra-edicion-especial', 'Camiseta Arquero Mouras Neg/Dor', 22000, '/images/products/camiseta-negra-dorada-frente.png', '/images/products/camiseta-negra-dorada-dorso.png', 'Edicion Especial', 'Camiseta de arquero negra con detalles dorados.', true, 'camisetas'),
('camiseta-blanca-quales', 'Camiseta Blanca F11 2024', 22000, '/images/products/camiseta-blanca-frente.png', '/images/products/camiseta-blanca-dorso.png', NULL, 'Camiseta F11 temporada 2024/2025.', true, 'camisetas'),
('camiseta-verde-rayada', 'Camiseta Titular F9', 22000, '/images/products/camiseta-verde-frente.png', '/images/products/camiseta-verde-dorso.png', NULL, 'Camiseta titular futbol 9.', true, 'camisetas'),
('vaso-ccc-plastico', 'Vaso CCC Plastico 500cc', 5000, '/images/products/vaso-gris.png', NULL, NULL, 'Vaso oficial del Club Carlos Casares 500cc.', false, 'accesorios')
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_products_category ON "Products"(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON "Products"(in_stock);

-- =============================================
-- 7. TABLA DE NOTICIAS
-- =============================================
CREATE TABLE IF NOT EXISTS "News" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'youtube')),
  action_text TEXT,
  action_url TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  author_id INTEGER REFERENCES "User"(id),
  slug TEXT UNIQUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "News" (title, description, image_url, action_text, action_url, active, display_order) VALUES
('Bienvenido al Club Carlos Casares', 'En capital Federal desde el interior de la provincia de Buenos Aires', '/images/equipo-capital.png', NULL, NULL, true, 1),
('Unete a nuestro grupo de WhatsApp!', 'Recibe todas las noticias y novedades del club directamente en tu telefono', '/images/whatsapp-group.png', 'Unirse al grupo', 'https://chat.whatsapp.com/KHLocslWDalL8BwtWL67Gf', true, 2)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_news_active ON "News"(active);
CREATE INDEX IF NOT EXISTS idx_news_display_order ON "News"(display_order);
CREATE INDEX IF NOT EXISTS idx_news_slug ON "News"(slug);

-- =============================================
-- 8. TABLAS DE LIKES Y COMENTARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS "NewsLikes" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES "News"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_news_like UNIQUE (news_id, user_id)
);

CREATE TABLE IF NOT EXISTS "NewsComments" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES "News"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CommentLikes" (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES "NewsComments"(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_news_likes_news ON "NewsLikes"(news_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_news ON "NewsComments"(news_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON "CommentLikes"(comment_id);

-- =============================================
-- 9. TABLA DE INFORMACION DEL CLUB
-- =============================================
CREATE TABLE IF NOT EXISTS "ClubInfo" (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  history_title TEXT NOT NULL DEFAULT 'Nuestra Historia',
  history_content TEXT NOT NULL,
  history_image_url TEXT,
  mission_title TEXT DEFAULT 'Nuestra Mision',
  mission_content TEXT,
  vision_title TEXT DEFAULT 'Nuestra Vision',
  vision_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "ClubInfo" (history_content, history_image_url) VALUES (
'El Club Carlos Casares fue fundado en 2017 por un grupo de estudiantes oriundos de la ciudad de Carlos Casares. En sus inicios, nuestro club se llamaba Carlos Casares FC, ya que solo contabamos con una disciplina deportiva. Sin embargo, con el paso del tiempo y gracias al entusiasmo de sus miembros, comenzaron a surgir nuevas disciplinas.

A lo largo de estos anos, hemos participado en numerosos campeonatos y torneos en distintas disciplinas. Sin embargo, nuestro mayor orgullo no esta en los trofeos que ganamos, sino en haber logrado unir a los estudiantes y miembros del club.

Hoy, el Club Carlos Casares es mucho mas que un espacio deportivo: es un segundo hogar para muchos.',
'/placeholder.svg?height=400&width=800'
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 10. TABLA DE COMISION DIRECTIVA
-- =============================================
CREATE TABLE IF NOT EXISTS "BoardMembers" (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  name TEXT NOT NULL,
  user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "BoardMembers" (position, name, display_order) VALUES
('Presidente', 'Francisco Martin Goyeneche', 1),
('Vicepresidente', 'Joaquin Gerez', 2),
('Secretario', 'Camilo Pagano', 3),
('Tesorero', 'Gonzalo Paez', 4),
('Vocal Titular 1', 'Juan Pedro Di Meola', 5),
('Vocal Titular 2', 'Federico Martin Goyeneche', 6),
('Vocal Titular 3', 'Celina Cabrera', 7)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_board_members_order ON "BoardMembers"(display_order);

-- =============================================
-- 11. TABLA DE DISCIPLINAS
-- =============================================
CREATE TABLE IF NOT EXISTS "Disciplines" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  foundation_year INTEGER,
  current_tournament TEXT,
  player_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "Disciplines" (name, slug, description, icon, foundation_year, current_tournament, player_count, display_order) VALUES
('Futbol 11', 'futbol-11', 'La maxima categoria del futbol competitivo.', 'CircleDot', 2017, 'Liga Regional Amateur', 32, 1),
('Futbol 9', 'futbol-9', 'Futbol de campo reducido con equipos de 9 jugadores.', 'CircleDot', 2018, 'Torneo Interuniversitario', 25, 2),
('Futbol 5 Femenino', 'futbol-5-femenino', 'Futbol femenino en cancha reducida.', 'CircleDot', 2019, 'Liga Femenina CABA', 18, 3),
('Basquet', 'basquet', 'Basketball competitivo representando al club.', 'Circle', 2018, 'Liga Universitaria', 15, 4),
('Hockey', 'hockey', 'Hockey sobre cesped y patines.', 'Minus', 2019, 'Torneo Metropolitano', 20, 5),
('Voley Mixto', 'voley-mixto', 'Volleyball mixto recreativo y competitivo.', 'Circle', 2020, 'Liga Amateur Mixta', 22, 6),
('Running', 'running', 'Grupo de running y atletismo.', 'PersonStanding', 2020, 'Maratones y Carreras', 30, 7)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_disciplines_slug ON "Disciplines"(slug);
CREATE INDEX IF NOT EXISTS idx_disciplines_active ON "Disciplines"(is_active);

-- =============================================
-- 12. TABLAS AUXILIARES DE DISCIPLINAS
-- =============================================
CREATE TABLE IF NOT EXISTS "DisciplineImages" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DisciplineStaff" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DisciplinePlayers" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position TEXT,
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "NewsDisciplines" (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES "News"(id) ON DELETE CASCADE,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_news_discipline UNIQUE (news_id, discipline_id)
);

CREATE INDEX IF NOT EXISTS idx_discipline_images_discipline ON "DisciplineImages"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_discipline_staff_discipline ON "DisciplineStaff"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_discipline_players_discipline ON "DisciplinePlayers"(discipline_id);

-- =============================================
-- 13. TABLA DE SPONSORS
-- =============================================
CREATE TABLE IF NOT EXISTS "Sponsors" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_active_order ON "Sponsors"(active, display_order);

-- =============================================
-- 14. SISTEMA DE ENCUESTAS
-- =============================================
CREATE TABLE IF NOT EXISTS "Surveys" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requires_login BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  questions JSONB NOT NULL,
  created_by INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  start_date TIMESTAMP,
  end_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SurveyResponses" (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES "Surveys"(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  responses JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_surveys_active ON "Surveys"(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON "SurveyResponses"(survey_id);

-- =============================================
-- 15. SISTEMA DE PARTIDOS
-- =============================================
CREATE TABLE IF NOT EXISTS "Tournaments" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discipline_id INTEGER REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  year INTEGER,
  url TEXT,
  category TEXT,
  division TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Locations" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  google_maps_url TEXT,
  city TEXT,
  discipline_id INTEGER REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Matches" (
  id SERIAL PRIMARY KEY,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES "Tournaments"(id) ON DELETE SET NULL,
  location_id INTEGER REFERENCES "Locations"(id) ON DELETE SET NULL,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  rival_team TEXT NOT NULL,
  match_type TEXT,
  is_home BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by INTEGER REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MatchResults" (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES "Matches"(id) ON DELETE CASCADE UNIQUE,
  our_score INTEGER NOT NULL,
  rival_score INTEGER NOT NULL,
  scorers JSONB,
  notes TEXT,
  created_by INTEGER REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Notifications" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  match_id INTEGER REFERENCES "Matches"(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "RoleDisciplines" (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES "SiteRole"(id) ON DELETE CASCADE,
  discipline_id INTEGER NOT NULL REFERENCES "Disciplines"(id) ON DELETE CASCADE,
  can_manage_matches BOOLEAN DEFAULT true,
  can_manage_results BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, discipline_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_discipline ON "Matches"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON "Matches"(match_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON "Notifications"(user_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_discipline ON "Tournaments"(discipline_id);

-- Insertar ubicaciones y torneos iniciales
INSERT INTO "Locations" (name, city) VALUES
('Estadio Club Carlos Casares', 'Buenos Aires'),
('Complejo Deportivo Norte', 'Buenos Aires'),
('Polideportivo Municipal', 'Buenos Aires')
ON CONFLICT DO NOTHING;

INSERT INTO "Tournaments" (name, description, start_date, is_active) VALUES
('Liga Regional Amateur 2025', 'Torneo oficial de la liga regional', '2025-03-01', true),
('Copa Provincial 2025', 'Copa eliminatoria provincial', '2025-04-15', true),
('Torneo Amistoso Invierno', 'Torneos amistosos de temporada baja', '2025-06-01', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 16. TABLAS DE TOKENS Y SESIONES
-- =============================================
CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "EmailVerificationTokens" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UserLogs" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON "PasswordResetTokens"(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON "EmailVerificationTokens"(token);
CREATE INDEX IF NOT EXISTS idx_user_logs_user ON "UserLogs"(user_id);

-- =============================================
-- 17. TABLAS DE SITIO EXTRA
-- =============================================
CREATE TABLE IF NOT EXISTS "SiteBanners" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  button_text TEXT,
  button_link TEXT,
  bg_color TEXT DEFAULT '#16a34a',
  text_color TEXT DEFAULT '#ffffff',
  is_visible BOOLEAN DEFAULT true,
  audience JSONB DEFAULT '[]',
  frequency TEXT DEFAULT 'always',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SitePopups" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  button_text TEXT,
  button_link TEXT,
  image_url TEXT,
  media_type TEXT DEFAULT 'none',
  video_url TEXT,
  video_autoplay BOOLEAN DEFAULT false,
  video_muted BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  roles JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SitePages" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
-- Ejecutado correctamente. La base de datos esta lista para usar.
