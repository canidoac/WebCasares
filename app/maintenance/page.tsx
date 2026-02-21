import { createClient } from "@/lib/supabase/server"
import { MaintenancePage } from "@/components/maintenance-page"
import { redirect } from 'next/navigation'

export default async function Maintenance() {
  const supabase = await createClient()

  const { data: config } = await supabase.from("SiteConfig").select("active_status_id").single()

  if (!config?.active_status_id) {
    redirect("/")
  }

  const { data: status } = await supabase
    .from("SiteStatus")
    .select("*")
    .eq("id", config.active_status_id)
    .single()

  if (!status || status.status_key !== "maintenance") {
    redirect("/")
  }

  return (
    <MaintenancePage
      title={status.title || "Sitio en Mantenimiento"}
      message={status.message || "Volveremos pronto"}
      mediaType={status.media_type || "none"}
      mediaUrl={status.media_url || undefined}
      showCountdown={status.show_countdown || false}
      launchDate={status.launch_date || undefined}
      backgroundMusicUrl={status.background_music_url || undefined}
      musicAutoplay={status.music_autoplay || false}
      musicVolume={status.music_volume || 0.5}
    />
  )
}
