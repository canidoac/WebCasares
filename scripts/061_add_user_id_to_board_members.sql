-- Agregar columna user_id para linkear BoardMembers con User
ALTER TABLE "BoardMembers" 
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD CONSTRAINT fk_board_member_user 
  FOREIGN KEY (user_id) 
  REFERENCES "User"(id) 
  ON DELETE SET NULL;

-- Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON "BoardMembers"(user_id);

-- Agregar comentario explicativo
COMMENT ON COLUMN "BoardMembers".user_id IS 'ID del usuario registrado vinculado a este miembro de la comisión directiva';
