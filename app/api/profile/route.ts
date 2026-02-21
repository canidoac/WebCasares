import { type NextRequest, NextResponse } from "next/server"
import { updateUserProfile } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, nombre, apellido, displayName, photoUrl, bio } = body

    const result = await updateUserProfile(userId, {
      nombre,
      apellido,
      displayName,
      photoUrl,
      bio,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Profile API error:", error)
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 })
  }
}
