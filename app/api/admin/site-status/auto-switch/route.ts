import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  console.log("[v0] Auto-switch API called")
  
  try {
    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    // Obtener el ID del estado "online"
    const { data: onlineStatus, error: fetchError } = await supabase
      .from("SiteStatus")
      .select("id")
      .eq("status_key", "online")
      .single()

    console.log("[v0] Online status query result:", { onlineStatus, fetchError })

    if (fetchError) {
      console.error("[v0] Error fetching online status:", fetchError)
      return NextResponse.json({ error: "Error al buscar estado online", details: fetchError }, { status: 500 })
    }

    if (!onlineStatus) {
      console.error("[v0] Online status not found")
      return NextResponse.json({ error: "Estado online no encontrado" }, { status: 404 })
    }

    console.log("[v0] Updating SiteConfig to status ID:", onlineStatus.id)

    // Actualizar SiteConfig para apuntar al estado online
    const { error: updateError } = await supabase
      .from("SiteConfig")
      .update({ active_status_id: onlineStatus.id })
      .eq("id", 1)

    if (updateError) {
      console.error("[v0] Error updating SiteConfig:", updateError)
      return NextResponse.json({ error: "Error al actualizar configuración", details: updateError }, { status: 500 })
    }

    console.log("[v0] Successfully switched to online status")
    return NextResponse.json({ success: true, message: "Estado cambiado a online correctamente" })
  } catch (error) {
    console.error("[v0] Unexpected error in auto-switch:", error)
    return NextResponse.json(
      { error: "Error inesperado al cambiar estado", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
