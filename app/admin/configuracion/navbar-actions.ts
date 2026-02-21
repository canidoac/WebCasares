"use server"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export interface NavbarItem {
  id: number
  label: string
  href: string
  status: "visible" | "hidden" | "coming_soon"
  visibility: "all" | "logged_in" | "logged_out"
  display_order: number
  is_protected: boolean
  allowed_roles?: number[] | null
}

export async function getNavbarItems(): Promise<NavbarItem[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("NavbarItems").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching navbar items:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getNavbarItems:", error)
    return []
  }
}

export async function updateNavbarItem(
  id: number,
  updates: Partial<Omit<NavbarItem, "id" | "is_protected">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { success: false, error: "No autorizado" }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("NavbarItems")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("[v0] Error updating navbar item:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin/configuracion")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateNavbarItem:", error)
    return { success: false, error: "Error al actualizar" }
  }
}

export async function createNavbarItem(
  item: Omit<NavbarItem, "id" | "is_protected">,
): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { success: false, error: "No autorizado" }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("NavbarItems")
      .insert({
        ...item,
        is_protected: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating navbar item:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin/configuracion")

    return { success: true, id: data.id }
  } catch (error) {
    console.error("[v0] Error in createNavbarItem:", error)
    return { success: false, error: "Error al crear" }
  }
}

export async function deleteNavbarItem(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { success: false, error: "No autorizado" }
    }

    const supabase = await createClient()

    // Check if item is protected
    const { data: item } = await supabase.from("NavbarItems").select("is_protected").eq("id", id).single()

    if (item?.is_protected) {
      return { success: false, error: "No se puede eliminar un item protegido" }
    }

    const { error } = await supabase.from("NavbarItems").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting navbar item:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    revalidatePath("/admin/configuracion")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in deleteNavbarItem:", error)
    return { success: false, error: "Error al eliminar" }
  }
}
