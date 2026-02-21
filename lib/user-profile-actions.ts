"use server"

import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/auth"

export interface UserProfileData {
  phone: string | null
  address: string | null
  city: string | null
  occupation: string | null
  employer: string | null
  education_level: string | null
  education_institution: string | null
  education_career: string | null
  cv_url: string | null
  skills: string | null
  notes: string | null
}

export async function getUserProfile(): Promise<UserProfileData | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)

  if (error || !data || data.length === 0) {
    return null
  }

  return data[0] as UserProfileData
}

export async function getUserProfileById(userId: number): Promise<UserProfileData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("user_id", userId)
    .limit(1)

  if (error || !data || data.length === 0) {
    return null
  }

  return data[0] as UserProfileData
}

export async function saveUserProfile(profileData: Partial<UserProfileData>): Promise<{ success: boolean; error?: string }> {
  const user = await getUser()
  if (!user) return { success: false, error: "No autenticado" }

  const supabase = await createClient()

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from("UserProfile")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)

  const payload = {
    ...profileData,
    updated_at: new Date().toISOString(),
  }

  if (existing && existing.length > 0) {
    // Actualizar
    const { error } = await supabase
      .from("UserProfile")
      .update(payload)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error updating UserProfile:", error)
      return { success: false, error: "Error al actualizar la informacion" }
    }
  } else {
    // Insertar
    const { error } = await supabase
      .from("UserProfile")
      .insert({
        user_id: user.id,
        ...payload,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error("[v0] Error inserting UserProfile:", error)
      return { success: false, error: "Error al guardar la informacion" }
    }
  }

  return { success: true }
}
