"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from 'next/navigation'

let logUserAction: any

try {
  const userLogsLib = require("@/lib/user-logs")
  logUserAction = userLogsLib.logUserAction
} catch (e) {
  console.log("[v0] User logs lib not available yet")
  logUserAction = async () => console.log("[v0] User logging skipped - lib not configured")
}

async function getNextSocioNumber(): Promise<string> {
  const supabase = await createClient()

  const { data: lastUser } = await supabase
    .from("User")
    .select("socio_number")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastUser || !lastUser.socio_number) {
    return "CCC0001"
  }

  const lastNumber = Number.parseInt(lastUser.socio_number.replace("CCC", ""), 10)
  const nextNumber = lastNumber + 1

  return `CCC${nextNumber.toString().padStart(4, "0")}`
}

export async function register(email: string, password: string, nombre: string, apellido: string, dni: string, birthDate: string, photoUrl?: string) {
  const supabase = await createClient()

  const normalizedEmail = email.toLowerCase()

  const { data: existingUser } = await supabase.from("User").select("id").eq("Email", normalizedEmail).maybeSingle()

  if (existingUser) {
    return { error: "Este email ya está registrado" }
  }

  // Verificar si el DNI ya existe
  const { data: existingDni } = await supabase.from("User").select("id").eq("dni", dni).maybeSingle()

  if (existingDni) {
    return { error: "Este DNI ya está registrado" }
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "La contraseña debe tener al menos una letra mayúscula" }
  }
  if (!/[0-9]/.test(password)) {
    return { error: "La contraseña debe tener al menos un número" }
  }

  const socioNumber = await getNextSocioNumber()

  const { data: newUser, error } = await supabase
    .from("User")
    .insert({
      Email: normalizedEmail,
      Pass: password,
      NOMBRE: nombre,
      APELLIDO: apellido,
      dni: dni,
      birth_date: birthDate,
      socio_number: socioNumber,
      photo_url: photoUrl,
      member_category: "Socio",
      ROL_ID: 1,
      email_verified: false,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating user:", error)
    return { error: "Error al crear el usuario" }
  }

  await logUserAction(newUser.id, "register", "Usuario registrado")

  const cookieStore = await cookies()
  cookieStore.set(
    "user_session",
    JSON.stringify({
      id: newUser.id,
      email: newUser.Email,
      nombre: newUser.NOMBRE,
      apellido: newUser.APELLIDO,
      dni: newUser.dni,
      birthDate: newUser.birth_date,
      socioNumber: newUser.socio_number,
      photoUrl: newUser.photo_url,
      memberCategory: newUser.member_category,
      rolId: String(newUser.ROL_ID || newUser.ID_ROL || ""),
      emailVerified: newUser.email_verified,
      registrationDate: newUser.created_at,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  )

  return { success: true, socioNumber }
}

export async function login(email: string, password: string) {
  const supabase = await createClient()

  const normalizedEmail = email.toLowerCase()

  const { data: user, error } = await supabase
    .from("User")
    .select("*")
    .eq("Email", normalizedEmail) // Buscar con email normalizado
    .eq("Pass", password)
    .maybeSingle()

  if (error || !user) {
    return { error: "Credenciales inválidas" }
  }

  console.log("[v0] Login - User from DB:", user)
  console.log("[v0] Login - ROL_ID:", user.ROL_ID)
  console.log("[v0] Login - ID_ROL:", user.ID_ROL)

  await logUserAction(user.id, "login", "Login exitoso")

  const cookieStore = await cookies()
  cookieStore.set(
    "user_session",
    JSON.stringify({
      id: user.id,
      email: user.Email,
      nombre: user.NOMBRE,
      apellido: user.APELLIDO,
      dni: user.dni || null,
      birthDate: user.birth_date || null,
      socioNumber: user.socio_number,
      photoUrl: user.photo_url,
      memberCategory: user.member_category,
      rolId: String(user.ROL_ID || user.ID_ROL || ""),
      emailVerified: user.email_verified,
      registrationDate: user.created_at || null,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  )

  return { success: true }
}

export async function logout() {
  const user = await getUser()
  if (user) {
    await logUserAction(user.id, "logout", "Usuario cerró sesión")
  }

  const cookieStore = await cookies()
  cookieStore.delete("user_session")
  redirect("/")
}

export async function getUser() {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    return null
  }

  try {
    return JSON.parse(userSession.value)
  } catch {
    return null
  }
}

export async function isAdmin() {
  const user = await getUser()
  return user?.rolId === "55" || String(user?.rolId) === "55"
}

export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getUser()
  if (!user || !user.rolId) return false

  const supabase = await createClient()
  const { data: role } = await supabase
    .from("SiteRole")
    .select("permissions")
    .eq("id", user.rolId)
    .single()

  if (!role || !role.permissions) return false

  return role.permissions[permission] === true
}

export async function getUserWithPermissions() {
  const user = await getUser()
  if (!user || !user.rolId) return null

  const supabase = await createClient()
  const { data: role } = await supabase
    .from("SiteRole")
    .select("permissions, name, display_name, color")
    .eq("id", user.rolId)
    .single()

  if (!role) return user

  return {
    ...user,
    permissions: role.permissions || {},
    roleName: role.name,
    roleDisplayName: role.display_name,
    roleColor: role.color,
  }
}

export async function updateUserProfile(
  userId: number,
  data: {
    nombre?: string
    apellido?: string
    displayName?: string
    photoUrl?: string
    bio?: string
  },
) {
  const supabase = await createClient()

  const updateData: Record<string, any> = {}
  if (data.nombre) updateData.NOMBRE = data.nombre
  if (data.apellido) updateData.APELLIDO = data.apellido
  if (data.displayName !== undefined) updateData.display_name = data.displayName
  if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl
  if (data.bio !== undefined) updateData.bio = data.bio

  const { error } = await supabase.from("User").update(updateData).eq("id", userId)

  if (error) {
    console.error("[v0] Error updating user:", error)
    return { error: "Error al actualizar el perfil" }
  }

  const changes = Object.keys(data)
    .filter((key) => data[key as keyof typeof data] !== undefined)
    .join(", ")
  await logUserAction(userId, "profile_update", `Campos actualizados: ${changes}`)

  const { data: updatedUser } = await supabase.from("User").select("*").eq("id", userId).single()

  if (updatedUser) {
    const cookieStore = await cookies()
    cookieStore.set(
      "user_session",
      JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.Email,
        nombre: updatedUser.NOMBRE,
        apellido: updatedUser.APELLIDO,
        socioNumber: updatedUser.socio_number,
        photoUrl: updatedUser.photo_url,
        memberCategory: updatedUser.member_category,
        bio: updatedUser.bio,
        rolId: String(updatedUser.ROL_ID || updatedUser.ID_ROL || ""),
        emailVerified: updatedUser.email_verified,
        birthDate: updatedUser.birth_date || null,
        registrationDate: updatedUser.created_at || null,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      },
    )
  }

  return { success: true }
}

export async function verifyEmail(token: string) {
  const supabase = await createClient()

  // Validar token
  const { data: verificationToken, error: tokenError } = await supabase
    .from("EmailVerificationTokens")
    .select("*")
    .eq("token", token)
    .eq("verified", false)
    .maybeSingle()

  if (tokenError || !verificationToken) {
    return { error: "Token inválido o ya utilizado" }
  }

  // Verificar expiración
  if (new Date(verificationToken.expires_at) < new Date()) {
    return { error: "El token ha expirado" }
  }

  // Marcar email como verificado
  const { error: updateError } = await supabase
    .from("User")
    .update({ email_verified: true })
    .eq("id", verificationToken.user_id)

  if (updateError) {
    return { error: "Error al verificar el email" }
  }

  // Marcar token como verificado
  await supabase.from("EmailVerificationTokens").update({ verified: true }).eq("id", verificationToken.id)

  // Log de verificación
  await logUserAction(verificationToken.user_id, "email_verified", "Email verificado exitosamente")

  return { success: true }
}

export async function canManageDiscipline(disciplineId: number): Promise<boolean> {
  const user = await getUser()
  if (!user || !user.rolId) return false

  const supabase = await createClient()
  const { data: role } = await supabase
    .from("SiteRole")
    .select("permissions")
    .eq("id", user.rolId)
    .single()

  if (!role || !role.permissions) return false

  if (role.permissions.manage_disciplines === true) {
    return true
  }

  const { data: roleDiscipline } = await supabase
    .from("RoleDisciplines")
    .select("*")
    .eq("role_id", user.rolId)
    .eq("discipline_id", disciplineId)
    .maybeSingle()

  return !!roleDiscipline
}

export async function getUserManagedDisciplines(): Promise<number[]> {
  const user = await getUser()
  if (!user || !user.rolId) return []

  const supabase = await createClient()
  const { data: role } = await supabase
    .from("SiteRole")
    .select("permissions")
    .eq("id", user.rolId)
    .single()

  if (!role || !role.permissions) return []

  if (role.permissions.manage_disciplines === true) {
    const { data: allDisciplines } = await supabase
      .from("Disciplines")
      .select("id")
    
    return allDisciplines?.map(d => d.id) || []
  }

  const { data: roleDisciplines } = await supabase
    .from("RoleDisciplines")
    .select("discipline_id")
    .eq("role_id", user.rolId)

  return roleDisciplines?.map(rd => rd.discipline_id) || []
}

export async function canManageCalendar(): Promise<{ canManage: boolean; managedDisciplineIds: number[] }> {
  const user = await getUser()
  if (!user || !user.rolId) return { canManage: false, managedDisciplineIds: [] }

  const supabase = await createClient()
  const { data: role } = await supabase
    .from("SiteRole")
    .select("permissions")
    .eq("id", user.rolId)
    .single()

  if (!role || !role.permissions) return { canManage: false, managedDisciplineIds: [] }

  // Si tiene manage_calendar o manage_disciplines, puede gestionar
  if (role.permissions.manage_calendar === true || role.permissions.manage_disciplines === true) {
    // Si tiene manage_disciplines, puede manejar todas
    if (role.permissions.manage_disciplines === true) {
      const { data: allDisciplines } = await supabase
        .from("Disciplines")
        .select("id")
      
      return { canManage: true, managedDisciplineIds: allDisciplines?.map(d => d.id) || [] }
    }
    
    // Si solo tiene manage_calendar, verificar disciplinas asignadas
    const { data: roleDisciplines } = await supabase
      .from("RoleDisciplines")
      .select("discipline_id, can_manage_matches")
      .eq("role_id", user.rolId)

    const managedIds = roleDisciplines
      ?.filter(rd => rd.can_manage_matches)
      ?.map(rd => rd.discipline_id) || []

    return { canManage: managedIds.length > 0, managedDisciplineIds: managedIds }
  }

  return { canManage: false, managedDisciplineIds: [] }
}
