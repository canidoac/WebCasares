import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token y contraseña requeridos" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabase = await createClient()

    // Validar token
    const { data: resetToken } = await supabase
      .from("passwordresettokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .maybeSingle()

    if (!resetToken) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Verificar expiración
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "El token ha expirado" }, { status: 400 })
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from("User")
      .update({ Pass: newPassword })
      .eq("id", resetToken.user_id)

    if (updateError) {
      return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 })
    }

    // Marcar token como usado
    await supabase.from("passwordresettokens").update({ used: true }).eq("id", resetToken.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in reset-password:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
