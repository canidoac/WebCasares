import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAdmin, getUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "club-carlos-casares/uploads"
    const filename = formData.get("filename") as string

    const userIsAdmin = await isAdmin()
    const currentUser = await getUser()

    if (!userIsAdmin) {
      if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
      if (!folder.startsWith("club-carlos-casares/users/profiles/")) {
        return NextResponse.json({ error: "No autorizado para esta carpeta" }, { status: 403 })
      }
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Solo se permiten imágenes y videos" }, { status: 400 })
    }

    let maxSize = 5 * 1024 * 1024 // 5MB por defecto
    
    if (folder.includes("/maintenance/") || folder.includes("/videos/")) {
      maxSize = 50 * 1024 * 1024 // 50MB para mantenimiento y videos
    } else if (folder.includes("/news/")) {
      maxSize = 10 * 1024 * 1024 // 10MB para noticias
    } else if (folder.includes("/sponsors/")) {
      maxSize = 2 * 1024 * 1024 // 2MB para sponsors (logos pequeños)
    }

    if (file.size > maxSize) {
      const maxMB = Math.floor(maxSize / 1024 / 1024)
      return NextResponse.json({ 
        error: `El archivo no puede superar ${maxMB}MB para esta carpeta` 
      }, { status: 400 })
    }

    const fileExtension = file.name.split(".").pop()
    const finalFilename = filename ? `${folder}/${filename}.${fileExtension}` : `${folder}/${Date.now()}-${file.name}`

    const blob = await put(finalFilename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: finalFilename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
