"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/auth"

export async function getClubInfo() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ClubInfo")
    .select("*")
    .eq("id", 1)
    .single()

  if (error) {
    console.error("[v0] Error fetching club info:", error)
    throw new Error("Error al obtener información del club")
  }

  return data
}

export async function updateClubInfo(formData: {
  history_title: string
  history_content: string
  history_image_url: string
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("ClubInfo")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)

  if (error) {
    console.error("[v0] Error updating club info:", error)
    throw new Error("Error al actualizar información del club")
  }

  revalidatePath("/club")
  revalidatePath("/admin/club")
  return { success: true }
}

export async function getBoardMembers() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data: members, error: membersError } = await supabase
    .from("BoardMembers")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (membersError) {
    console.error("[v0] Error fetching board members:", membersError)
    throw new Error("Error al obtener miembros")
  }

  // Si hay miembros con user_id, obtenemos los datos de usuarios
  const userIds = members?.filter(m => m.user_id).map(m => m.user_id) || []
  
  if (userIds.length === 0) {
    return members || []
  }

  const { data: users, error: usersError } = await supabase
    .from("User")
    .select("id, NOMBRE, APELLIDO, photo_url, display_name")
    .in("id", userIds)

  if (usersError) {
    console.error("[v0] Error fetching users:", usersError)
  }

  // Combinar datos manualmente
  const membersWithUsers = members?.map(member => ({
    ...member,
    user: member.user_id && users 
      ? users.find(u => u.id === member.user_id) 
      : null
  }))

  return membersWithUsers || []
}

export async function getAllUsers() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("User")
    .select("id, NOMBRE, APELLIDO, photo_url, display_name")
    .order("NOMBRE", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching users:", error)
    throw new Error("Error al obtener usuarios")
  }

  return data || []
}

export async function createBoardMember(formData: {
  position: string
  name: string
  user_id?: number | null
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: lastMember } = await supabase
    .from("BoardMembers")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from("BoardMembers")
    .insert({
      position: formData.position,
      name: formData.name,
      user_id: formData.user_id || null,
      display_order: (lastMember?.display_order || 0) + 1,
    })

  if (error) {
    console.error("[v0] Error creating board member:", error)
    throw new Error("Error al crear miembro")
  }

  revalidatePath("/club")
  revalidatePath("/admin/club")
  return { success: true }
}

export async function updateBoardMember(id: number, formData: {
  position: string
  name: string
  display_order: number
  user_id?: number | null
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("BoardMembers")
    .update({
      position: formData.position,
      name: formData.name,
      display_order: formData.display_order,
      user_id: formData.user_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating board member:", error)
    throw new Error("Error al actualizar miembro")
  }

  revalidatePath("/club")
  revalidatePath("/admin/club")
  return { success: true }
}

export async function deleteBoardMember(id: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("BoardMembers")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting board member:", error)
    throw new Error("Error al eliminar miembro")
  }

  revalidatePath("/club")
  revalidatePath("/admin/club")
  return { success: true }
}
