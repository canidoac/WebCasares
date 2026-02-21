-- Crear tabla de Sponsors
CREATE TABLE IF NOT EXISTS "Sponsors" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "logo_url" TEXT NOT NULL,
  "website_url" TEXT,
  "active" BOOLEAN DEFAULT true,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Agregar índice para optimizar consultas
CREATE INDEX IF NOT EXISTS "idx_sponsors_active_order" ON "Sponsors" ("active", "display_order");

-- Comentarios
COMMENT ON TABLE "Sponsors" IS 'Tabla de patrocinadores del club';
COMMENT ON COLUMN "Sponsors"."name" IS 'Nombre del sponsor';
COMMENT ON COLUMN "Sponsors"."logo_url" IS 'URL del logo almacenado en CCC_STORAGEConfig_Site/Sponsor/';
COMMENT ON COLUMN "Sponsors"."website_url" IS 'URL de la página web del sponsor';
COMMENT ON COLUMN "Sponsors"."active" IS 'Si el sponsor está activo o no';
COMMENT ON COLUMN "Sponsors"."display_order" IS 'Orden de visualización';
