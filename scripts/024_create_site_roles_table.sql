-- Create comprehensive roles and permissions system
-- This allows fine-grained access control for different user types

CREATE TABLE IF NOT EXISTS "SiteRole" (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- Color for UI display (indigo for default)
  
  -- Permissions stored as JSONB for flexibility
  permissions JSONB DEFAULT '{}',
  
  -- Metadata
  is_system_role BOOLEAN DEFAULT true, -- System roles cannot be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles with specific permissions
INSERT INTO "SiteRole" (id, name, display_name, description, color, permissions, is_system_role) VALUES
(1, 'socio', 'Socio', 'Miembro básico del club sin acceso al panel de administración', '#10b981', '{
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
  "view_analytics": true,
  "manage_colors": true
}', true),

(56, 'dev', 'Desarrollador', 'Desarrollador con acceso limitado a configuración del sitio', '#8b5cf6', '{
  "panel_admin": true,
  "manage_news": true,
  "manage_site_config": true,
  "manage_site_config_limited": {
    "banner": false,
    "popup": false,
    "status": true,
    "navbar": false,
    "footer": false,
    "colors": false
  },
  "view_analytics": true,
  "manage_own_profile": true
}', true)

ON CONFLICT (id) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Create helper function to check permissions
CREATE OR REPLACE FUNCTION has_permission(user_role_id INTEGER, permission_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_permissions JSONB;
  result BOOLEAN;
BEGIN
  SELECT permissions INTO role_permissions
  FROM "SiteRole"
  WHERE id = user_role_id;
  
  IF role_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if permission exists and is true
  result := (role_permissions #>> string_to_array(permission_path, '.'))::BOOLEAN;
  RETURN COALESCE(result, false);
END;
$$ LANGUAGE plpgsql;

-- Add indexes
CREATE INDEX idx_site_role_name ON "SiteRole"(name);

-- Update User table foreign key if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_role_fk' 
    AND table_name = 'User'
  ) THEN
    ALTER TABLE "User" 
    ADD CONSTRAINT user_role_fk 
    FOREIGN KEY ("ID_ROL") REFERENCES "SiteRole"(id);
  END IF;
END $$;

COMMENT ON TABLE "SiteRole" IS 'System roles with granular permissions stored as JSONB';
COMMENT ON COLUMN "SiteRole".permissions IS 'JSONB structure defining what actions this role can perform';
