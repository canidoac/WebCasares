import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = await createClient()

    // Obtener estados
    const statusesResult = await supabase
      .from("SiteStatus")
      .select("*")
      .order('id')

    if (statusesResult.error) throw statusesResult.error

    // Obtener config - puede no existir
    const { data: configArray, error: configError } = await supabase
      .from("SiteConfig")
      .select("active_status_id")
      .eq("id", 1)
      .limit(1)

    let activeStatusId = null
    const configData = configArray?.[0]

    if (!configData) {
      // Si no hay registro en SiteConfig, intentar crear uno
      // Obtener el ID del estado "online" por defecto
      const onlineStatus = statusesResult.data?.find(s => s.status_key === 'online')
      const defaultStatusId = onlineStatus?.id || (statusesResult.data?.[0]?.id ?? 1)
      
      // Crear registro inicial en SiteConfig
      const { data: newConfig, error: insertError } = await supabase
        .from("SiteConfig")
        .insert({ 
          id: 1, 
          active_status_id: defaultStatusId,
          show_header_banner: false,
          show_popup: false,
          enable_registration: true 
        })
        .select("active_status_id")
        .single()

      if (insertError) {
        console.error("[v0] Error creating SiteConfig:", insertError)
        // Si falla la insercion, usar el default
        activeStatusId = defaultStatusId
      } else {
        activeStatusId = newConfig.active_status_id
      }
    } else {
      activeStatusId = configData.active_status_id
    }

    return NextResponse.json({
      statuses: statusesResult.data || [],
      activeStatusId
    })
  } catch (error) {
    console.error("[v0] Error fetching site status:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener estado del sitio" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const supabase = await createClient()

    if (body.activeStatusId) {
      // Usar upsert para crear o actualizar
      const { error } = await supabase
        .from("SiteConfig")
        .upsert({ 
          id: 1, 
          active_status_id: body.activeStatusId,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      return NextResponse.json({ success: true, message: "Estado del sitio aplicado" })
    }

    if (body.statusId) {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }
      
      if (body.title !== undefined) updateData.title = body.title
      if (body.message !== undefined) updateData.message = body.message
      if (body.media_type !== undefined) updateData.media_type = body.media_type
      if (body.media_url !== undefined) updateData.media_url = body.media_url
      if (body.show_countdown !== undefined) updateData.show_countdown = body.show_countdown
      if (body.launch_date !== undefined) updateData.launch_date = body.launch_date
      if (body.redirect_url !== undefined) updateData.redirect_url = body.redirect_url
      if (body.auto_switch_to_online !== undefined) updateData.auto_switch_to_online = body.auto_switch_to_online
      if (body.final_video_url !== undefined) updateData.final_video_url = body.final_video_url
      if (body.background_music_url !== undefined) updateData.background_music_url = body.background_music_url
      if (body.music_autoplay !== undefined) updateData.music_autoplay = body.music_autoplay
      if (body.music_volume !== undefined) updateData.music_volume = body.music_volume

      const { error } = await supabase
        .from("SiteStatus")
        .update(updateData)
        .eq("id", body.statusId)

      if (error) throw error
      return NextResponse.json({ success: true, message: "Configuración guardada" })
    }

    return NextResponse.json({ error: "Missing statusId or activeStatusId" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error updating site status:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar estado del sitio" },
      { status: 500 }
    )
  }
}
