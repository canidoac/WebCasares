import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const banner = await request.json()

  const { id, ...bannerData } = banner

  const { data, error } = await supabase
    .from("SiteBanner")
    .update(bannerData)
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating banner:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ banner: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("SiteBanner")
    .delete()
    .eq("id", params.id)

  if (error) {
    console.error("[v0] Error deleting banner:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
