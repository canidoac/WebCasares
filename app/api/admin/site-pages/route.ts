import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: pages, error } = await supabase
      .from('SitePages')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name')

    if (error) {
      console.error('[v0] Error fetching site pages:', error)
      return NextResponse.json({ error: 'Error al cargar páginas' }, { status: 500 })
    }

    return NextResponse.json({ pages: pages || [] })
  } catch (error) {
    console.error('[v0] Error in GET /api/admin/site-pages:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
