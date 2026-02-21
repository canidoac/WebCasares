-- Arreglar la columna coming_soon_message que falta en SiteConfig

ALTER TABLE "SiteConfig" 
ADD COLUMN IF NOT EXISTS coming_soon_message TEXT DEFAULT 'Estamos preparando algo especial para ti. ¡Vuelve pronto!';

COMMENT ON COLUMN "SiteConfig".coming_soon_message IS 'Mensaje de la página de Próximamente';
