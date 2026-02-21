-- Actualizar la tabla SiteConfig para incluir el campo visibility en navbar_items
UPDATE "SiteConfig"
SET navbar_items = '[
  {"label": "Inicio", "href": "/", "status": "visible", "visibility": "all"},
  {"label": "Tienda", "href": "/tienda", "status": "visible", "icon": "ShoppingBag", "visibility": "all"},
  {"label": "Club", "href": "/club", "status": "coming_soon", "icon": "Users", "visibility": "all"}
]'::jsonb
WHERE id = 1;
