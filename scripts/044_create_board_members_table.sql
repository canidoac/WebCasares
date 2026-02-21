-- Crear tabla para comisión directiva
CREATE TABLE IF NOT EXISTS "BoardMembers" (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar datos iniciales de la comisión directiva
INSERT INTO "BoardMembers" (position, name, display_order) VALUES
('Presidente', 'Francisco Martin Goyeneche', 1),
('Vicepresidente', 'Joaquin Gerez', 2),
('Secretario', 'Camilo Pagano', 3),
('Tesorero', 'Gonzalo Paez', 4),
('Vocal Titular 1', 'Juan Pedro Di Meola', 5),
('Vocal Titular 2', 'Federico Martin Goyeneche', 6),
('Vocal Titular 3', 'Celina Cabrera', 7)
ON CONFLICT DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_board_members_active ON "BoardMembers"(is_active);
CREATE INDEX IF NOT EXISTS idx_board_members_order ON "BoardMembers"(display_order);
