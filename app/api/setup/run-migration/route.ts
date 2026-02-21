import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const migrations: Record<string, string> = {
  "013_create_password_reset_tokens": `
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
}

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json()

    if (!script || !migrations[script]) {
      return NextResponse.json({ error: "Script de migración no encontrado" }, { status: 404 })
    }

    const supabase = await createClient()
    const sql = migrations[script]

    console.log("[v0] Ejecutando migración:", script)

    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", { query: statement })

      if (error) {
        console.error("[v0] Error en statement:", statement, error)
        // Si no existe la función exec_sql, intentar crear directamente
        if (error.message?.includes("function") || error.message?.includes("does not exist")) {
          return NextResponse.json(
            {
              error:
                "No se puede ejecutar SQL automáticamente. Por favor, usa las instrucciones manuales en la página.",
              details: "La función exec_sql no está disponible en tu configuración de Supabase.",
            },
            { status: 500 },
          )
        }
        throw error
      }
    }

    console.log("[v0] Migración completada exitosamente")

    return NextResponse.json({
      success: true,
      message: "Migración ejecutada exitosamente. La tabla PasswordResetTokens ha sido creada.",
    })
  } catch (error) {
    console.error("[v0] Error ejecutando migración:", error)
    return NextResponse.json(
      {
        error: "Error ejecutando la migración",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
