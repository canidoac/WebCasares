-- Agregar columna de color para identificar visualmente cada estado
ALTER TABLE "SiteStatus" ADD COLUMN IF NOT EXISTS status_color TEXT DEFAULT '#10b981';

-- Actualizar el color según el estado actual
UPDATE "SiteStatus" 
SET status_color = CASE 
  WHEN current_status = 'online' THEN '#10b981'  -- Verde (--club-verde)
  WHEN current_status = 'maintenance' THEN '#fbbf24'  -- Amarillo (--club-amarillo)
  WHEN current_status = 'coming_soon' THEN '#8b5cf6'  -- Violeta
  ELSE '#10b981'
END
WHERE id = 1;
