"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/auth"

export async function getUsers() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("User")
    .select(`
      *,
      role:SiteRole(id, name, display_name, color)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching users:", error)
    throw new Error("Error al obtener usuarios")
  }

  console.log("[v0] Fetched users with roles:", data)
  return data || []
}

export async function getRoles() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("SiteRole")
    .select("*")
    .order("id", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching roles:", error)
    throw new Error("Error al obtener roles")
  }

  return data || []
}

export async function updateUserRole(userId: number, roleId: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: roleData } = await supabase
    .from("SiteRole")
    .select("display_name")
    .eq("id", roleId)
    .single()

  const { error } = await supabase
    .from("User")
    .update({
      ROL_ID: roleId,
      ROL_NAME: roleData?.display_name || null,
    })
    .eq("id", userId)

  if (error) {
    console.error("[v0] Error updating user role:", error)
    throw new Error("Error al actualizar rol del usuario")
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function deleteUser(userId: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: user } = await supabase
    .from("User")
    .select("ROL_ID")
    .eq("id", userId)
    .single()

  if (user?.ROL_ID === 55) {
    throw new Error("No se puede eliminar el usuario administrador principal")
  }

  const { error } = await supabase
    .from("User")
    .delete()
    .eq("id", userId)

  if (error) {
    console.error("[v0] Error deleting user:", error)
    throw new Error("Error al eliminar usuario")
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function toggleUserMute(userId: number, isMuted: boolean, reason?: string) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("User")
    .update({
      is_muted: isMuted,
      muted_at: isMuted ? new Date().toISOString() : null,
      muted_reason: isMuted ? reason : null,
    })
    .eq("id", userId)

  if (error) {
    console.error("[v0] Error toggling user mute:", error)
    throw new Error("Error al silenciar/activar usuario")
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function toggleUserBlock(userId: number, isBlocked: boolean, reason?: string) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("User")
    .update({
      is_blocked: isBlocked,
      blocked_at: isBlocked ? new Date().toISOString() : null,
      blocked_reason: isBlocked ? reason : null,
    })
    .eq("id", userId)

  if (error) {
    console.error("[v0] Error toggling user block:", error)
    throw new Error("Error al bloquear/desbloquear usuario")
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}
