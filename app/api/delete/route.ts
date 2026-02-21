import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Delete from Vercel Blob
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
