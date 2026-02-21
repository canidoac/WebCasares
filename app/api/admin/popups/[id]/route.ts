import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('[v0] Updating popup:', params.id, 'with data:', body.name)

    const { id, ...popupData } = body

    const updateData = {
      ...popupData,
      image_url: popupData.image_url || null,
      button_link: popupData.button_link || null,
      media_url: popupData.media_url || null,
      media_type: popupData.media_type || null,
      video_autoplay: popupData.video_autoplay || false,
      video_muted: popupData.video_muted !== false,
      updated_at: new Date().toISOString(),
    }

    const { data: popup, error } = await supabase
      .from('SitePopup')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating popup:', error)
      throw error
    }

    console.log('[v0] Popup updated successfully:', popup.name)
    return NextResponse.json({ popup })
  } catch (error: any) {
    console.error('[v0] Error updating popup:', error)
    return NextResponse.json({ 
      error: 'Failed to update popup',
      details: error?.message || error
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('SitePopup')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting popup:', error)
    return NextResponse.json({ error: 'Failed to delete popup' }, { status: 500 })
  }
}
