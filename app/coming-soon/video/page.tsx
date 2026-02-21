import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { CountdownVideo } from "@/components/countdown-video"

export default async function ComingSoonVideo() {
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

  if (!status || status.status_key !== "online") {
    redirect("/")
  }

  const { data: comingSoonStatus } = await supabase
    .from("SiteStatus")
    .select("*")
    .eq("status_key", "coming_soon")
    .single()

  if (!comingSoonStatus?.final_video_url) {
    redirect("/")
  }

  return (
    <CountdownVideo
      videoUrl={comingSoonStatus.final_video_url}
      redirectUrl={comingSoonStatus.redirect_url || "/"}
    />
  )
}
