"use server"

import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleNewsLike(newsId: number) {
  const user = await getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  const supabase = await createClient()

  const { data: existingLike } = await supabase
    .from('NewsLikes')
    .select('id')
    .eq('news_id', newsId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingLike) {
    // Eliminar like
    const { error } = await supabase
      .from('NewsLikes')
      .delete()
      .eq('news_id', newsId)
      .eq('user_id', user.id)

    if (error) throw error
  } else {
    // Agregar like
    const { error } = await supabase
      .from('NewsLikes')
      .insert({
        news_id: newsId,
        user_id: user.id,
      })

    if (error) throw error
  }

  return { success: true }
}

export async function addNewsComment(newsId: number, comment: string) {
  const user = await getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('NewsComments')
    .insert({
      news_id: newsId,
      user_id: user.id,
      comment: comment.trim(),
    })

  if (error) throw error

  revalidatePath('/noticias')
  return { success: true }
}

export async function deleteNewsComment(commentId: number) {
  const user = await getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  const supabase = await createClient()

  // Verificar que el comentario pertenece al usuario
  const { data: comment } = await supabase
    .from('NewsComments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.user_id !== user.id) {
    throw new Error("No tienes permiso para eliminar este comentario")
  }

  const { error } = await supabase
    .from('NewsComments')
    .delete()
    .eq('id', commentId)

  if (error) throw error

  revalidatePath('/noticias')
  return { success: true }
}

export async function toggleCommentLike(commentId: number) {
  const user = await getUser()
  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  const supabase = await createClient()

  const { data: existingLike } = await supabase
    .from('CommentLikes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingLike) {
    // Eliminar like
    const { error } = await supabase
      .from('CommentLikes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)

    if (error) throw error
  } else {
    // Agregar like
    const { error } = await supabase
      .from('CommentLikes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
      })

    if (error) throw error
  }

  return { success: true }
}

export async function getNewsComments(newsId: number) {
  const supabase = await createClient()
  const user = await getUser()

  const { data, error } = await supabase
    .from('NewsComments')
    .select(`
      id,
      comment,
      created_at,
      user_id,
      user:User!inner(id, nombre:NOMBRE, apellido:APELLIDO, photo_url, display_name)
    `)
    .eq('news_id', newsId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching comments:', error)
    return []
  }

  const commentsWithLikes = await Promise.all(
    (data || []).map(async (comment) => {
      // Contar likes del comentario
      const { count: likesCount } = await supabase
        .from('CommentLikes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment.id)

      // Verificar si el usuario actual dio like
      let userLiked = false
      if (user) {
        const { data: userLike } = await supabase
          .from('CommentLikes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', user.id)
          .maybeSingle()

        userLiked = !!userLike
      }

      return {
        ...comment,
        likesCount: likesCount || 0,
        userLiked,
      }
    })
  )

  return commentsWithLikes
}

export async function getNewsLikesList(newsId: number) {
  const user = await getUser()
  if (!user || user.rol_name !== 'Admin') {
    throw new Error("No tienes permiso para ver esta información")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('NewsLikes')
    .select(`
      id,
      created_at,
      user:User!inner(id, nombre:NOMBRE, apellido:APELLIDO, photo_url, Email)
    `)
    .eq('news_id', newsId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching news likes:', error)
    return []
  }

  return data || []
}

export async function getCommentLikesList(commentId: number) {
  const user = await getUser()
  if (!user || user.rol_name !== 'Admin') {
    throw new Error("No tienes permiso para ver esta información")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('CommentLikes')
    .select(`
      id,
      created_at,
      user:User!inner(id, nombre:NOMBRE, apellido:APELLIDO, photo_url, Email)
    `)
    .eq('comment_id', commentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching comment likes:', error)
    return []
  }

  return data || []
}
