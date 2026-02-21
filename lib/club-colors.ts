export const CLUB_COLORS = {
  verde: "#2e8b58",
  amarillo: "#ffd700",
  blanco: "#ffffff",
  negro: "#000000",
  azul: "#020817",
} as const

export type ClubColorName = keyof typeof CLUB_COLORS

export function getClubColor(colorName: ClubColorName): string {
  return CLUB_COLORS[colorName]
}

export function getAllClubColors() {
  return Object.entries(CLUB_COLORS).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))
}

export interface ClubColor {
  id: string
  name: string
  hex_value: string
  description?: string
  is_primary: boolean
  is_official: boolean
  display_order: number
}

export const DEFAULT_CLUB_COLORS = [
  { name: "Verde", hex_value: "#2e8b58", is_official: true },
  { name: "Amarillo", hex_value: "#ffd700", is_official: true },
  { name: "Blanco", hex_value: "#ffffff", is_official: true },
  { name: "Negro", hex_value: "#000000", is_official: true },
  { name: "Azul", hex_value: "#020817", is_official: true },
]

export async function getOfficialClubColors(): Promise<ClubColor[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ClubColors')
      .select('*')
      .eq('is_official', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching club colors:', error)
      return DEFAULT_CLUB_COLORS as ClubColor[]
    }

    return data || DEFAULT_CLUB_COLORS as ClubColor[]
  } catch (error) {
    console.error('[v0] Error in getOfficialClubColors:', error)
    return DEFAULT_CLUB_COLORS as ClubColor[]
  }
}

export async function saveCustomColor(hexValue: string, name?: string): Promise<ClubColor | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // Verificar si el color ya existe
    const { data: existing } = await supabase
      .from('ClubColors')
      .select('*')
      .eq('hex_value', hexValue)
      .single()

    if (existing) {
      return existing as ClubColor
    }

    // Obtener el siguiente display_order
    const { data: maxOrder } = await supabase
      .from('ClubColors')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.display_order || 0) + 1

    // Insertar nuevo color
    const { data, error } = await supabase
      .from('ClubColors')
      .insert({
        name: name || `Color ${hexValue}`,
        hex_value: hexValue,
        is_official: false,
        is_primary: false,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error saving custom color:', error)
      return null
    }

    return data as ClubColor
  } catch (error) {
    console.error('[v0] Error in saveCustomColor:', error)
    return null
  }
}
