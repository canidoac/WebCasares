"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/auth"

export interface NewsFormData {
  title: string
  description: string
  short_description?: string
  content_html?: string
  image_url: string
  media_type?: 'image' | 'gif' | 'video' | 'youtube'
  thumbnail_url?: string
  action_text?: string
  action_url?: string
  active: boolean
  show_in_carousel?: boolean
  comments_locked?: boolean
  display_order: number
  starts_at?: string
  expires_at?: string
  images?: Array<{ image_url: string; media_type?: string; is_primary: boolean; position: number }>
  disciplines?: number[]
}

export async function getNews() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("News").select("*").order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching news:", error)
    throw new Error("Error al obtener noticias")
  }

  return data
}

export async function createNews(formData: NewsFormData) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  console.log("[v0] Creating news with data:", formData)

  const { data: newsData, error } = await supabase.from("News").insert({
    title: formData.title,
    description: formData.description,
    short_description: formData.short_description || null,
    content_html: formData.content_html || null,
    image_url: formData.image_url,
    media_type: formData.media_type || 'image',
    thumbnail_url: formData.thumbnail_url || null,
    action_text: formData.action_text || null,
    action_url: formData.action_url || null,
    active: formData.active,
    show_in_carousel: formData.show_in_carousel ?? true,
    comments_locked: formData.comments_locked ?? false,
    display_order: formData.display_order,
    starts_at: formData.starts_at && formData.starts_at !== "" ? formData.starts_at : null,
    expires_at: formData.expires_at && formData.expires_at !== "" ? formData.expires_at : null,
  }).select().single()

  if (error || !newsData) {
    console.error("[v0] Error creating news:", error)
    throw new Error("Error al crear noticia: " + error?.message)
  }

  if (formData.disciplines && formData.disciplines.length > 0) {
    const disciplineRelations = formData.disciplines.map(disciplineId => ({
      news_id: newsData.id,
      discipline_id: disciplineId
    }))

    const { error: disciplinesError } = await supabase
      .from("NewsDisciplines")
      .insert(disciplineRelations)

    if (disciplinesError) {
      console.error("[v0] Error creating discipline relations:", disciplinesError)
    }
  }

  // Insertando imágenes si se proporcionan
  if (formData.images && formData.images.length > 0) {
    const images = formData.images.map(img => ({
      news_id: newsData.id,
      image_url: img.image_url,
      media_type: img.media_type || 'image',
      is_primary: img.is_primary,
      position: img.position
    }))

    const { error: imagesError } = await supabase
      .from("NewsImages")
      .insert(images)

    if (imagesError) {
      console.error("[v0] Error creating news images:", imagesError)
    }
  }

  console.log("[v0] News created successfully")

  revalidatePath("/admin/noticias")
  revalidatePath("/")
  revalidatePath("/disciplinas")
  return { success: true }
}

export async function updateNews(id: number, formData: NewsFormData) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("News")
    .update({
      title: formData.title,
      description: formData.description,
      short_description: formData.short_description || null,
      content_html: formData.content_html || null,
      image_url: formData.image_url,
      media_type: formData.media_type || 'image',
      thumbnail_url: formData.thumbnail_url || null,
      action_text: formData.action_text || null,
      action_url: formData.action_url || null,
      active: formData.active,
      show_in_carousel: formData.show_in_carousel ?? true,
      comments_locked: formData.comments_locked ?? false,
      display_order: formData.display_order,
      starts_at: formData.starts_at && formData.starts_at !== "" ? formData.starts_at : null,
      expires_at: formData.expires_at && formData.expires_at !== "" ? formData.expires_at : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating news:", error)
    throw new Error("Error al actualizar noticia")
  }

  if (formData.disciplines !== undefined) {
    await supabase.from("NewsDisciplines").delete().eq("news_id", id)

    if (formData.disciplines.length > 0) {
      const disciplineRelations = formData.disciplines.map(disciplineId => ({
        news_id: id,
        discipline_id: disciplineId
      }))

      await supabase.from("NewsDisciplines").insert(disciplineRelations)
    }
  }

  // Actualizando imágenes
  if (formData.images !== undefined) {
    await supabase.from("NewsImages").delete().eq("news_id", id)

    if (formData.images.length > 0) {
      const images = formData.images.map(img => ({
        news_id: id,
        image_url: img.image_url,
        media_type: img.media_type || 'image',
        is_primary: img.is_primary,
        position: img.position
      }))

      await supabase.from("NewsImages").insert(images)
    }
  }

  revalidatePath("/admin/noticias")
  revalidatePath("/")
  revalidatePath("/disciplinas")
  return { success: true }
}

export async function deleteNews(id: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase.from("News").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting news:", error)
    throw new Error("Error al eliminar noticia")
  }

  revalidatePath("/admin/noticias")
  return { success: true }
}

export async function getDisciplines() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("Disciplines")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching disciplines:", error)
    return []
  }

  return data || []
}

export async function createDefaultNews() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: lastNews } = await supabase
    .from("News")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const newDisplayOrder = (lastNews?.display_order || 0) + 1

  const timestamp = new Date().toISOString()
  const { data, error } = await supabase
    .from("News")
    .insert({
      title: "Nueva Noticia",
      description: "Haz clic en editar para personalizar esta noticia...",
      image_url: "/breaking-news-banner.png",
      action_text: null,
      action_url: null,
      active: false,
      display_order: newDisplayOrder,
      starts_at: null,
      expires_at: null,
      created_at: timestamp,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating default news:", error)
    throw new Error("Error al crear noticia: " + error.message)
  }

  revalidatePath("/admin/noticias")
  return data
}
