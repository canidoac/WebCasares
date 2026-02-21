import { NextResponse } from 'next/server'
import { saveCustomColor } from '@/lib/club-colors'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hex_value, name } = body

    if (!hex_value || !/^#[0-9A-Fa-f]{6}$/.test(hex_value)) {
      return NextResponse.json(
        { error: 'Invalid hex color value' },
        { status: 400 }
      )
    }

    const color = await saveCustomColor(hex_value, name)
    
    if (!color) {
      return NextResponse.json(
        { error: 'Failed to save color' },
        { status: 500 }
      )
    }

    return NextResponse.json({ color })
  } catch (error) {
    console.error('[v0] Error in POST /api/club-colors/custom:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
