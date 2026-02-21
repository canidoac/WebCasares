-- Corregir el auto-incremento del ID en la tabla SiteRole
-- El problema es que id es INTEGER PRIMARY KEY pero no tiene auto-incremento configurado

-- Primero, verificar el valor máximo actual
DO $$ 
DECLARE
  max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) INTO max_id FROM "SiteRole";
  
  -- Crear una secuencia si no existe
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'siterole_id_seq') THEN
    EXECUTE format('CREATE SEQUENCE siterole_id_seq START WITH %s', max_id + 1);
  ELSE
    -- Si existe, actualizar el valor de la secuencia
    EXECUTE format('SELECT setval(''siterole_id_seq'', %s, true)', max_id);
  END IF;
  
  -- Configurar el default del campo id para usar la secuencia
  ALTER TABLE "SiteRole" ALTER COLUMN id SET DEFAULT nextval('siterole_id_seq');
  
  RAISE NOTICE 'Auto-incremento configurado correctamente para SiteRole.id con secuencia iniciando en %', max_id + 1;
END $$;

-- Asegurar que la secuencia sea propiedad de la columna
ALTER SEQUENCE siterole_id_seq OWNED BY "SiteRole".id;

COMMENT ON SEQUENCE siterole_id_seq IS 'Secuencia para generar IDs automáticos en la tabla SiteRole';
