-- Insertar registro inicial en SiteStatus si no existe
INSERT INTO "SiteStatus" (
  id,
  current_status,
  title,
  message,
  media_type,
  media_url,
  show_countdown,
  launch_date,
  status_color
)
SELECT 
  1,
  'online',
  'Página Web Online',
  'Funcionando correctamente.',
  'none',
  NULL,
  false,
  NULL,
  '#10b981'
WHERE NOT EXISTS (
  SELECT 1 FROM "SiteStatus" WHERE id = 1
);
