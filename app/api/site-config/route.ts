import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_CONFIG = {
  show_header_banner: false,
  show_popup: false,
  enable_registration: true,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("SiteConfig").select("*").single()

    if (error || !data) {
      return NextResponse.json(DEFAULT_CONFIG)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching site config:", error)
    return NextResponse.json(DEFAULT_CONFIG, { status: 200 })
  }
}
