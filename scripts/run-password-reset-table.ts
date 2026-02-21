import { createClient } from "@/lib/supabase/server"

async function createPasswordResetTable() {
  const supabase = await createClient()

  console.log("[v0] Creating PasswordResetTokens table...")

  const { error } = await supabase.rpc("exec_sql", {
    sql: `
      -- Tabla para tokens de recuperación de contraseña
      CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON "PasswordResetTokens"(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON "PasswordResetTokens"(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON "PasswordResetTokens"(expires_at);
    `,
  })

  if (error) {
    console.error("[v0] Error creating table:", error)
    return
  }

  console.log("[v0] PasswordResetTokens table created successfully!")
}

createPasswordResetTable()
