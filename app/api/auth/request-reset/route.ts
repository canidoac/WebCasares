import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendPasswordResetEmail } from "@/lib/email"

function generateRandomToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: user, error: userError } = await supabase.from("User").select("*").eq("Email", email).maybeSingle()

    if (userError) {
      console.error("[v0] Error buscando usuario:", userError)
      return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
    }

    // Por seguridad, siempre devolvemos success incluso si el usuario no existe
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const resetToken = generateRandomToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hora

    const { error: insertError } = await supabase.from("passwordresettokens").insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
    })

    if (insertError) {
      // Si la tabla no existe, informar al usuario
      if (insertError.message?.includes("Could not find the table")) {
        console.error(
          "[v0] La tabla passwordresettokens no existe. Ejecuta el script 013_create_password_reset_tokens.sql",
        )
        return NextResponse.json(
          {
            error: "Sistema de recuperación no configurado. Por favor contacta al administrador.",
            details: "La tabla de tokens de recuperación no existe en la base de datos.",
          },
          { status: 503 },
        )
      }
      console.error("[v0] Error al crear token:", insertError)
      return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
    }

    const emailResult = await sendPasswordResetEmail(email, resetToken, user.NOMBRE || "Usuario")

    if (emailResult.error) {
      console.error("[v0] Error enviando email:", emailResult.error)
      // No devolvemos error al usuario por seguridad, pero lo logueamos
      return NextResponse.json({
        success: true,
        warning: "El enlace fue generado pero puede haber un problema con el envío del email",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in request-reset:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
