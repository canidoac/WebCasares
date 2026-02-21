import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { is_active } = await request.json()

  const { data, error } = await supabase
    .from("SiteBanner")
    .update({ is_active })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error toggling banner:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ banner: data })
}
