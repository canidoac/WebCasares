'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ClubColor {
  name: string
  hex_value: string
  is_primary: boolean
}

export function useClubColors() {
  const [colors, setColors] = useState<ClubColor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchColors() {
      const { data, error } = await supabase
        .from('ClubColors')
        .select('name, hex_value, is_primary')
        .eq('is_official', true)
        .order('display_order', { ascending: true })

      if (!error && data) {
        setColors(data)
      }
      setLoading(false)
    }

    fetchColors()
  }, [])

  const getColor = (name: string, fallback: string = '#2e8b58') => {
    return colors.find(c => c.name === name)?.hex_value || fallback
  }

  return { colors, loading, getColor }
}
