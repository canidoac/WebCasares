-- Correcciones y mejoras al sistema de partidos

-- Agregar columnas faltantes a Tournaments
ALTER TABLE "Tournaments" 
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS division TEXT,
ADD COLUMN IF NOT EXISTS discipline_id INTEGER REFERENCES "Disciplines"(id) ON DELETE CASCADE;

-- Agregar columnas faltantes a Locations
ALTER TABLE "Locations"
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS discipline_id INTEGER REFERENCES "Disciplines"(id) ON DELETE CASCADE;

-- Eliminar la columna address ya que usaremos google_maps_url
ALTER TABLE "Locations" DROP COLUMN IF EXISTS address;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tournaments_discipline ON "Tournaments"(discipline_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_active ON "Tournaments"(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_discipline ON "Locations"(discipline_id);

-- Actualizar torneos existentes para que tengan year
UPDATE "Tournaments" SET year = EXTRACT(YEAR FROM start_date) WHERE year IS NULL AND start_date IS NOT NULL;

COMMENT ON COLUMN "Tournaments".year IS 'Año del torneo';
COMMENT ON COLUMN "Tournaments".url IS 'URL de la página del torneo si existe';
COMMENT ON COLUMN "Tournaments".category IS 'Categoría del torneo (Primera, Reserva, etc)';
COMMENT ON COLUMN "Tournaments".division IS 'División del torneo';
COMMENT ON COLUMN "Locations".google_maps_url IS 'Link de Google Maps de la ubicación';
