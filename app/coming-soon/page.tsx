import { createClient } from "@/lib/supabase/server"
import { MaintenancePage } from "@/components/maintenance-page"
import { redirect } from 'next/navigation'

export default async function ComingSoon() {
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

  if (!status || status.status_key !== "coming_soon") {
    redirect("/")
  }

  return (
    <MaintenancePage
      title={status.title || "Próximamente"}
      message={status.message || "Estamos preparando algo especial"}
      mediaType={status.media_type || "none"}
      mediaUrl={status.media_url || undefined}
      showCountdown={status.show_countdown || false}
      launchDate={status.launch_date || undefined}
      redirectUrl={status.redirect_url || undefined}
      finalVideoUrl={status.final_video_url || undefined}
      autoSwitchToOnline={status.auto_switch_to_online || false}
    />
  )
}
