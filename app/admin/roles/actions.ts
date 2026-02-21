"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/auth"

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

export async function createRole(roleData: {
  name: string
  display_name: string
  description?: string
  color: string
  permissions: Record<string, any>
  disciplines?: any[]
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const disciplines = roleData.disciplines
  const roleDataToInsert = { ...roleData }
  delete roleDataToInsert.disciplines

  const { data: newRole, error } = await supabase
    .from("SiteRole")
    .insert({
      name: roleDataToInsert.name,
      display_name: roleDataToInsert.display_name,
      description: roleDataToInsert.description,
      color: roleDataToInsert.color,
      permissions: roleDataToInsert.permissions,
      is_system_role: false,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating role:", error)
    throw new Error("Error al crear rol")
  }

  if (disciplines && disciplines.length > 0 && newRole) {
    const { error: disciplinesError } = await supabase
      .from("RoleDisciplines")
      .insert(
        disciplines.map((d: any) => ({
          role_id: newRole.id,
          discipline_id: d.discipline_id,
          can_manage_matches: d.can_manage_matches ?? true,
          can_manage_results: d.can_manage_results ?? true,
        }))
      )

    if (disciplinesError) {
      console.error("[v0] Error creating role disciplines:", disciplinesError)
      // No lanzar error aquí, el rol ya se creó
    }
  }

  revalidatePath("/admin/roles")
  return { success: true }
}

export async function updateRole(
  roleId: number,
  roleData: {
    display_name?: string
    description?: string
    color?: string
    permissions?: Record<string, any>
    disciplines?: any[]
  }
) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: role } = await supabase
    .from("SiteRole")
    .select("is_system_role")
    .eq("id", roleId)
    .single()

  if (role?.is_system_role) {
    delete roleData.display_name
  }

  const disciplines = roleData.disciplines
  delete roleData.disciplines

  const { error } = await supabase
    .from("SiteRole")
    .update({
      ...roleData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roleId)

  if (error) {
    console.error("[v0] Error updating role:", error)
    throw new Error(error.message || "Error al actualizar rol")
  }

  if (disciplines !== undefined) {
    // Primero eliminar las disciplinas existentes
    await supabase
      .from("RoleDisciplines")
      .delete()
      .eq("role_id", roleId)

    // Luego insertar las nuevas
    if (disciplines && disciplines.length > 0) {
      const { error: disciplinesError } = await supabase
        .from("RoleDisciplines")
        .insert(
          disciplines.map((d: any) => ({
            role_id: roleId,
            discipline_id: d.discipline_id,
            can_manage_matches: d.can_manage_matches ?? true,
            can_manage_results: d.can_manage_results ?? true,
          }))
        )

      if (disciplinesError) {
        console.error("[v0] Error updating role disciplines:", disciplinesError)
        throw new Error("Error al actualizar disciplinas del rol")
      }
    }
  }

  revalidatePath("/admin/roles")
  return { success: true }
}

export async function deleteRole(roleId: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: role } = await supabase
    .from("SiteRole")
    .select("is_system_role")
    .eq("id", roleId)
    .single()

  if (role?.is_system_role) {
    throw new Error("No se pueden eliminar roles del sistema")
  }

  const { data: usersWithRole } = await supabase
    .from("User")
    .select("id")
    .eq("ROL_ID", roleId)
    .limit(1)

  if (usersWithRole && usersWithRole.length > 0) {
    throw new Error("No se puede eliminar un rol que está siendo usado por usuarios")
  }

  const { error } = await supabase
    .from("SiteRole")
    .delete()
    .eq("id", roleId)

  if (error) {
    console.error("[v0] Error deleting role:", error)
    throw new Error("Error al eliminar rol")
  }

  revalidatePath("/admin/roles")
  return { success: true }
}
