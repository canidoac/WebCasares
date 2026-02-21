import { NextResponse } from 'next/server'
import { getOfficialClubColors } from '@/lib/club-colors'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const colors = await getOfficialClubColors()
    return NextResponse.json({ colors })
  } catch (error) {
    console.error('[v0] Error in GET /api/club-colors/official:', error)
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 })
  }
}
