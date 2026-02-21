import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { is_active } = await request.json()
    
    const { data: popup, error } = await supabase
      .from('SitePopup')
      .update({ 
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ popup })
  } catch (error) {
    console.error('[v0] Error toggling popup:', error)
    return NextResponse.json({ error: 'Failed to toggle popup' }, { status: 500 })
  }
}
