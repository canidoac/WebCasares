-- Agregar permisos granulares para cada panel de administración
-- Esto permite dar acceso específico a diferentes áreas del admin

-- Actualizar roles existentes con los nuevos permisos granulares
UPDATE "SiteRole" SET permissions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(permissions, '{manage_club}', 'false'),
              '{manage_disciplines}', 'false'
            ),
            '{manage_sponsors}', 'false'
          ),
          '{manage_navbar}', 'false'
        ),
        '{manage_news_admin}', 'false'
      ),
      '{manage_users_admin}', 'false'
    ),
    '{manage_roles_admin}', 'false'
  ),
  '{manage_store_admin}', 'false'
), updated_at = NOW()
WHERE name = 'socio';

-- Actualizar rol admin con acceso completo a todos los paneles
UPDATE "SiteRole" SET permissions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(permissions, '{manage_club}', 'true'),
              '{manage_disciplines}', 'true'
            ),
            '{manage_sponsors}', 'true'
          ),
          '{manage_navbar}', 'true'
        ),
        '{manage_news_admin}', 'true'
      ),
      '{manage_users_admin}', 'true'
    ),
    '{manage_roles_admin}', 'true'
  ),
  '{manage_store_admin}', 'true'
), updated_at = NOW()
WHERE name = 'admin';

-- Actualizar rol dev con acceso limitado
UPDATE "SiteRole" SET permissions = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(permissions, '{manage_club}', 'false'),
              '{manage_disciplines}', 'false'
            ),
            '{manage_sponsors}', 'false'
          ),
          '{manage_navbar}', 'true'
        ),
        '{manage_news_admin}', 'true'
      ),
      '{manage_users_admin}', 'false'
    ),
    '{manage_roles_admin}', 'false'
  ),
  '{manage_store_admin}', 'false'
), updated_at = NOW()
WHERE name = 'dev';

COMMENT ON COLUMN "SiteRole".permissions IS 'Permisos granulares: panel_admin (acceso general), manage_club, manage_disciplines, manage_news_admin, manage_users_admin, manage_roles_admin, manage_sponsors, manage_store_admin, manage_navbar, manage_site_config, manage_banners, manage_popups, manage_colors, view_analytics';
