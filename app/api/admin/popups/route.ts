import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: popups, error } = await supabase
      .from('SitePopup')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching popups:', error)
      throw error
    }

    console.log('[v0] Popups fetched successfully:', popups?.length || 0)
    return NextResponse.json({ popups })
  } catch (error) {
    console.error('[v0] Error fetching popups:', error)
    return NextResponse.json({ error: 'Failed to fetch popups', details: error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('[v0] Creating popup with data:', body.name)

    const { id, ...popupData } = body

    const insertData = {
      ...popupData,
      image_url: popupData.image_url || null,
      button_link: popupData.button_link || null,
      media_url: popupData.media_url || null,
      media_type: popupData.media_type || null,
      video_autoplay: popupData.video_autoplay || false,
      video_muted: popupData.video_muted !== false,
    }

    console.log('[v0] Inserting popup data with opacity:', insertData.opacity)

    const { data: popup, error } = await supabase
      .from('SitePopup')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('[v0] Error inserting popup:', error)
      throw error
    }

    console.log('[v0] Popup created successfully:', popup.name)
    return NextResponse.json({ popup })
  } catch (error: any) {
    console.error('[v0] Error creating popup:', error)
    return NextResponse.json({ 
      error: 'Failed to create popup', 
      details: error?.message || error 
    }, { status: 500 })
  }
}
