"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/auth"

export async function getSponsors() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("Sponsors")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching sponsors:", error)
    throw new Error("Error al obtener sponsors")
  }

  return data || []
}

export async function createSponsor(formData: {
  name: string
  logo_url: string
  website_url?: string
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  // Obtener el último order para agregar al final
  const { data: lastSponsor } = await supabase
    .from("Sponsors")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from("Sponsors")
    .insert({
      ...formData,
      display_order: (lastSponsor?.display_order || 0) + 1,
      active: true,
    })

  if (error) {
    console.error("[v0] Error creating sponsor:", error)
    throw new Error("Error al crear sponsor")
  }

  revalidatePath("/")
  revalidatePath("/admin/sponsors")
  return { success: true }
}

export async function updateSponsor(id: number, formData: {
  name: string
  logo_url: string
  website_url?: string
  active: boolean
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Sponsors")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating sponsor:", error)
    throw new Error("Error al actualizar sponsor")
  }

  revalidatePath("/")
  revalidatePath("/admin/sponsors")
  return { success: true }
}

export async function deleteSponsor(id: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Sponsors")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting sponsor:", error)
    throw new Error("Error al eliminar sponsor")
  }

  revalidatePath("/")
  revalidatePath("/admin/sponsors")
  return { success: true }
}

export async function updateSponsorOrder(id: number, newOrder: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Sponsors")
    .update({ display_order: newOrder })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating sponsor order:", error)
    throw new Error("Error al actualizar orden")
  }

  revalidatePath("/")
  revalidatePath("/admin/sponsors")
  return { success: true }
}
