import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log("[v0] Verificando tabla PasswordResetTokens...")

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    const createIndexesSQL = [
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON "PasswordResetTokens"(token);',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON "PasswordResetTokens"(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON "PasswordResetTokens"(expires_at);',
    ]

    // Ejecutar creación de tabla
    const { error: tableError } = await supabase.rpc("exec_sql", { query: createTableSQL })

    if (tableError) {
      console.error("[v0] Error creando tabla:", tableError)
      return NextResponse.json(
        {
          success: false,
          error: "No se puede ejecutar SQL directamente en Supabase.",
          message:
            "Por favor, ve a tu dashboard de Supabase (SQL Editor) y ejecuta el script 013_create_password_reset_tokens.sql manualmente.",
          instructions: [
            "1. Ve a https://supabase.com/dashboard/project/[tu-proyecto]/sql/new",
            "2. Copia el contenido del archivo scripts/013_create_password_reset_tokens.sql",
            "3. Pégalo en el editor SQL",
            "4. Haz clic en 'Run' o presiona Cmd/Ctrl + Enter",
            "5. Vuelve a intentar el reset de contraseña",
          ],
        },
        { status: 500 },
      )
    }

    // Ejecutar creación de índices
    for (const indexSQL of createIndexesSQL) {
      await supabase.rpc("exec_sql", { query: indexSQL })
    }

    console.log("[v0] Tabla PasswordResetTokens creada exitosamente")

    return NextResponse.json({
      success: true,
      message: "Tabla PasswordResetTokens creada exitosamente",
    })
  } catch (error) {
    console.error("[v0] Error en setup:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error ejecutando script",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
