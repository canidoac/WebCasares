import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: banners, error } = await supabase
    .from("SiteBanner")
    .select("*")
    .order("priority", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ banners })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const banner = await request.json()

  const { id, ...bannerData } = banner

  const { data, error } = await supabase
    .from("SiteBanner")
    .insert([bannerData])
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating banner:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ banner: data })
}
