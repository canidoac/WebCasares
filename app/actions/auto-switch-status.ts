'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function autoSwitchToOnline() {
  console.log("[v0] Auto-switch Server Action called")
  
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
      return { success: false, error: "Error al buscar estado online", details: fetchError }
    }

    if (!onlineStatus) {
      console.error("[v0] Online status not found")
      return { success: false, error: "Estado online no encontrado" }
    }

    console.log("[v0] Updating SiteConfig to status ID:", onlineStatus.id)

    // Actualizar SiteConfig para apuntar al estado online
    const { error: updateError } = await supabase
      .from("SiteConfig")
      .update({ active_status_id: onlineStatus.id })
      .eq("id", 1)

    if (updateError) {
      console.error("[v0] Error updating SiteConfig:", updateError)
      return { success: false, error: "Error al actualizar configuración", details: updateError }
    }

    console.log("[v0] Successfully switched to online status")
    
    // Revalidar todas las páginas para que el middleware vea el cambio
    revalidatePath('/', 'layout')
    
    return { success: true, message: "Estado cambiado a online correctamente" }
  } catch (error) {
    console.error("[v0] Unexpected error in auto-switch:", error)
    return {
      success: false,
      error: "Error inesperado al cambiar estado",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}
