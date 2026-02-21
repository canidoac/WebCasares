"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isAdmin, canManageDiscipline, getUserManagedDisciplines, getUser } from "@/lib/auth"

export async function getDisciplines() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const managedDisciplineIds = await getUserManagedDisciplines()

  const supabase = await createClient()
  
  let query = supabase
    .from("Disciplines")
    .select("*")
    .order("display_order", { ascending: true })

  // Si no puede gestionar todas, filtrar por las que tiene asignadas
  if (managedDisciplineIds.length > 0) {
    const { data: role } = await supabase
      .from("SiteRole")
      .select("permissions")
      .eq("id", (await getUser())?.rolId || 0)
      .single()

    if (role?.permissions?.manage_disciplines !== true) {
      query = query.in("id", managedDisciplineIds)
    }
  }

  const { data: disciplines, error } = await query

  if (error) {
    console.error("[v0] Error fetching disciplines:", error)
    throw new Error("Error al obtener disciplinas")
  }

  console.log("[v0] Disciplines loaded:", disciplines?.length || 0)

  if (!disciplines || disciplines.length === 0) {
    return []
  }

  // Luego obtener staff e imágenes para cada disciplina
  const disciplinesWithDetails = await Promise.all(
    disciplines.map(async (discipline) => {
      // Obtener staff
      const { data: staff } = await supabase
        .from("DisciplineStaff")
        .select("*")
        .eq("discipline_id", discipline.id)
        .order("display_order", { ascending: true })

      // Obtener imágenes
      const { data: images } = await supabase
        .from("DisciplineImages")
        .select("*")
        .eq("discipline_id", discipline.id)
        .order("display_order", { ascending: true })

      return {
        ...discipline,
        staff: staff || [],
        images: images || []
      }
    })
  )

  return disciplinesWithDetails
}

export async function createDiscipline(formData: {
  name: string
  description: string
  icon: string
  foundation_year: number
  current_tournament: string
  player_count: number
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const slug = formData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const { data: lastDiscipline } = await supabase
    .from("Disciplines")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from("Disciplines")
    .insert({
      ...formData,
      slug,
      display_order: (lastDiscipline?.display_order || 0) + 1,
      is_active: true,
    })

  if (error) {
    console.error("[v0] Error creating discipline:", error)
    throw new Error("Error al crear disciplina")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function updateDiscipline(id: number, formData: any) {
  const canManage = await canManageDiscipline(id)
  if (!canManage) {
    throw new Error("No tienes permiso para editar esta disciplina")
  }

  const supabase = await createClient()

  const updateData: any = {}
  if (formData.name !== undefined) updateData.name = formData.name
  if (formData.slug !== undefined) updateData.slug = formData.slug
  if (formData.description !== undefined) updateData.description = formData.description
  if (formData.icon !== undefined) updateData.icon = formData.icon
  if (formData.foundation_year !== undefined) updateData.foundation_year = formData.foundation_year
  if (formData.current_tournament !== undefined) updateData.current_tournament = formData.current_tournament
  if (formData.is_active !== undefined) updateData.is_active = formData.is_active
  if (formData.display_order !== undefined) updateData.display_order = formData.display_order
  
  updateData.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from("Disciplines")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating discipline:", error)
    throw new Error("Error al actualizar disciplina")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function deleteDiscipline(id: number) {
  const canManage = await canManageDiscipline(id)
  if (!canManage) {
    throw new Error("No tienes permiso para eliminar esta disciplina")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Disciplines")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting discipline:", error)
    throw new Error("Error al eliminar disciplina")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function addDisciplineImage(disciplineId: number, formData: {
  image_url: string
  caption: string | null
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: lastImage } = await supabase
    .from("DisciplineImages")
    .select("display_order")
    .eq("discipline_id", disciplineId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from("DisciplineImages")
    .insert({
      discipline_id: disciplineId,
      ...formData,
      display_order: (lastImage?.display_order || 0) + 1,
    })

  if (error) {
    console.error("[v0] Error adding image:", error)
    throw new Error("Error al agregar imagen")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function deleteDisciplineImage(id: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("DisciplineImages")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting image:", error)
    throw new Error("Error al eliminar imagen")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function addDisciplineStaff(disciplineId: number, formData: {
  role: string
  name: string
}) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No tienes permiso para gestionar esta disciplina")
  }

  const supabase = await createClient()

  const { data: lastStaff } = await supabase
    .from("DisciplineStaff")
    .select("display_order")
    .eq("discipline_id", disciplineId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from("DisciplineStaff")
    .insert({
      discipline_id: disciplineId,
      ...formData,
      display_order: (lastStaff?.display_order || 0) + 1,
    })

  if (error) {
    console.error("[v0] Error adding staff:", error)
    throw new Error("Error al agregar miembro")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function deleteDisciplineStaff(id: number) {
  const supabase = await createClient()

  // Verificar permisos sobre la disciplina del staff
  const { data: staffRow } = await supabase
    .from("DisciplineStaff")
    .select("discipline_id")
    .eq("id", id)
    .limit(1)

  if (!staffRow?.[0]) throw new Error("Miembro no encontrado")

  const canManage = await canManageDiscipline(staffRow[0].discipline_id)
  if (!canManage) {
    throw new Error("No tienes permiso para gestionar esta disciplina")
  }

  const { error } = await supabase
    .from("DisciplineStaff")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting staff:", error)
    throw new Error("Error al eliminar miembro")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function getDisciplineById(id: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("Disciplines")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching discipline:", error)
    throw new Error("Error al obtener disciplina")
  }

  return data
}

export async function getAllUsers() {
  // Permitir a admins y managers de disciplinas ver usuarios
  const user = await getUser()
  if (!user) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("User")
    .select("id, NOMBRE, APELLIDO, display_name, photo_url, Email")
    .order("NOMBRE", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching users:", error)
    throw new Error("Error al obtener usuarios")
  }

  return data || []
}

export async function getDisciplinePlayers(disciplineId: number) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No tienes permiso para gestionar esta disciplina")
  }

  const supabase = await createClient()
  
  const { data: players, error } = await supabase
    .from("DisciplinePlayers")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("joined_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching players:", error)
    throw new Error("Error al obtener jugadores")
  }

  if (!players) return []

  // Obtener datos de usuarios
  const userIds = players.map(p => p.user_id)
  const { data: users } = await supabase
    .from("User")
    .select("id, NOMBRE, APELLIDO, display_name, photo_url, Email")
    .in("id", userIds)

  const usersMap = new Map(users?.map(u => [u.id, u]) || [])

  return players.map(player => ({
    ...player,
    user: usersMap.get(player.user_id) || null
  }))
}

export async function addDisciplinePlayer(disciplineId: number, formData: {
  user_id: number
  position: string | null
  jersey_number: number | null
}) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No tienes permiso para gestionar esta disciplina")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("DisciplinePlayers")
    .insert({
      discipline_id: disciplineId,
      ...formData,
      is_active: true,
      joined_date: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error("[v0] Error adding player:", error)
    if (error.code === '23505') {
      throw new Error("Este usuario ya está en esta disciplina")
    }
    throw new Error("Error al agregar jugador")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function removeDisciplinePlayer(playerId: number) {
  // Buscar la disciplina del jugador para verificar permisos
  const supabase = await createClient()
  const { data: player } = await supabase
    .from("DisciplinePlayers")
    .select("discipline_id")
    .eq("id", playerId)
    .limit(1)

  if (!player?.[0]) throw new Error("Jugador no encontrado")

  const canManage = await canManageDiscipline(player[0].discipline_id)
  if (!canManage) {
    throw new Error("No tienes permiso para gestionar esta disciplina")
  }

  const { error } = await supabase
    .from("DisciplinePlayers")
    .delete()
    .eq("id", playerId)

  if (error) {
    console.error("[v0] Error removing player:", error)
    throw new Error("Error al eliminar jugador")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function getDisciplineStaff(disciplineId: number) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No tienes permiso para gestionar esta disciplina")
  }

  const supabase = await createClient()
  
  const { data: staff, error } = await supabase
    .from("DisciplineStaff")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching staff:", error)
    throw new Error("Error al obtener cuerpo técnico")
  }

  if (!staff) return []

  // Obtener datos de usuarios vinculados
  const userIds = staff.filter(s => s.user_id).map(s => s.user_id)
  let usersMap = new Map()
  
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("User")
      .select("id, NOMBRE, APELLIDO, display_name, photo_url, Email")
      .in("id", userIds)
    
    usersMap = new Map(users?.map(u => [u.id, u]) || [])
  }

  return staff.map(member => ({
    ...member,
    user: member.user_id ? usersMap.get(member.user_id) || null : null
  }))
}

export async function addDisciplineStaffMember(disciplineId: number, formData: {
  user_id: number
  role: string
}) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  // Obtener el nombre del usuario
  const { data: user } = await supabase
    .from("User")
    .select("NOMBRE, APELLIDO, display_name")
    .eq("id", formData.user_id)
    .single()

  const name = user?.display_name || `${user?.NOMBRE} ${user?.APELLIDO}`

  const { data: lastStaff } = await supabase
    .from("DisciplineStaff")
    .select("display_order")
    .eq("discipline_id", disciplineId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from("DisciplineStaff")
    .insert({
      discipline_id: disciplineId,
      user_id: formData.user_id,
      role: formData.role,
      name: name,
      display_order: (lastStaff?.display_order || 0) + 1
    })

  if (error) {
    console.error("[v0] Error adding staff:", error)
    throw new Error("Error al agregar miembro del cuerpo técnico")
  }

  revalidatePath("/disciplinas")
  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function getDisciplineImages(disciplineId: number) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("DisciplineImages")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching images:", error)
    throw new Error("Error al obtener imágenes")
  }

  return data || []
}

export async function getTournaments(disciplineId: number) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("Tournaments")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching tournaments:", error)
    throw new Error("Error al obtener torneos")
  }

  return data || []
}

export async function createTournament(formData: {
  discipline_id: number
  name: string
  year: number
}) {
  const canManage = await canManageDiscipline(formData.discipline_id)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Tournaments")
    .insert({
      ...formData,
      is_active: true
    })

  if (error) {
    console.error("[v0] Error creating tournament:", error)
    throw new Error("Error al crear torneo")
  }

  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function getLocations(disciplineId: number) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("Locations")
    .select("*")
    .eq("discipline_id", disciplineId)
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching locations:", error)
    throw new Error("Error al obtener ubicaciones")
  }

  return data || []
}

export async function createLocation(formData: {
  discipline_id: number
  name: string
  address: string | null
  city: string | null
}) {
  const canManage = await canManageDiscipline(formData.discipline_id)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Locations")
    .insert(formData)

  if (error) {
    console.error("[v0] Error creating location:", error)
    throw new Error("Error al crear ubicación")
  }

  revalidatePath("/admin/disciplinas")
  return { success: true }
}

export async function getMatches(disciplineId: number, upcoming: boolean = true) {
  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()
  
  const now = new Date().toISOString()
  
  let query = supabase
    .from("Matches")
    .select(`
      *,
      tournament:Tournaments(name, year),
      location:Locations(name, google_maps_url, city),
      result:MatchResults(our_score, rival_score, scorers)
    `)
    .eq("discipline_id", disciplineId)

  if (upcoming) {
    query = query.gte("match_date", now).order("match_date", { ascending: true })
  } else {
    query = query.lt("match_date", now).order("match_date", { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching matches:", error)
    throw new Error("Error al obtener partidos")
  }

  return data || []
}

export async function createMatch(formData: {
  discipline_id: number
  tournament_id: number
  location_id: number
  match_date: string
  match_time: string
  rival_team: string
  match_type: string | null
}) {
  const canManage = await canManageDiscipline(formData.discipline_id)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("Matches")
    .insert({
      ...formData,
      status: 'scheduled'
    })

  if (error) {
    console.error("[v0] Error creating match:", error)
    throw new Error("Error al crear partido")
  }

  revalidatePath("/admin/disciplinas")
  revalidatePath("/disciplinas")
  return { success: true }
}

export async function updateMatchResult(matchId: number, formData: {
  our_score: number
  rival_score: number
  scorers: any[]
}) {
  const supabase = await createClient()

  // Obtener el match para verificar permisos
  const { data: match } = await supabase
    .from("Matches")
    .select("discipline_id")
    .eq("id", matchId)
    .single()

  if (!match) {
    throw new Error("Partido no encontrado")
  }

  const canManage = await canManageDiscipline(match.discipline_id)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  // Insertar o actualizar en MatchResults
  const { error } = await supabase
    .from("MatchResults")
    .upsert({
      match_id: matchId,
      our_score: formData.our_score,
      rival_score: formData.rival_score,
      scorers: formData.scorers
    }, {
      onConflict: 'match_id'
    })

  if (error) {
    console.error("[v0] Error updating result:", error)
    throw new Error("Error al actualizar resultado")
  }

  // Actualizar estado del partido a completado
  await supabase
    .from("Matches")
    .update({ status: 'completed' })
    .eq("id", matchId)

  revalidatePath("/admin/disciplinas")
  revalidatePath("/disciplinas")
  return { success: true }
}

export async function deleteMatch(matchId: number) {
  const supabase = await createClient()

  // Obtener el match para verificar permisos
  const { data: match } = await supabase
    .from("Matches")
    .select("discipline_id")
    .eq("id", matchId)
    .single()

  if (!match) {
    throw new Error("Partido no encontrado")
  }

  const canManage = await canManageDiscipline(match.discipline_id)
  if (!canManage) {
    throw new Error("No autorizado")
  }

  const { error } = await supabase
    .from("Matches")
    .delete()
    .eq("id", matchId)

  if (error) {
    console.error("[v0] Error deleting match:", error)
    throw new Error("Error al eliminar partido")
  }

  revalidatePath("/admin/disciplinas")
  revalidatePath("/disciplinas")
  return { success: true }
}
