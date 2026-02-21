-- Agregar columnas para moderación de usuarios
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "is_muted" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "is_blocked" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "muted_at" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "blocked_at" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "muted_reason" TEXT,
ADD COLUMN IF NOT EXISTS "blocked_reason" TEXT;

-- Agregar índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_is_muted ON "User"("is_muted");
CREATE INDEX IF NOT EXISTS idx_user_is_blocked ON "User"("is_blocked");

-- Agregar columna ROL_NAME si no existe (para mostrar nombre del rol)
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "ROL_NAME" VARCHAR(50);

COMMENT ON COLUMN "User"."is_muted" IS 'Usuario silenciado - no puede comentar en noticias';
COMMENT ON COLUMN "User"."is_blocked" IS 'Usuario bloqueado - no puede acceder al sistema';
COMMENT ON COLUMN "User"."muted_reason" IS 'Razón por la cual el usuario fue silenciado';
COMMENT ON COLUMN "User"."blocked_reason" IS 'Razón por la cual el usuario fue bloqueado';
