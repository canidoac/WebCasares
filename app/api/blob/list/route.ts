import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''

    const { blobs } = await list({
      prefix: folder,
      limit: 100,
    })

    return NextResponse.json({ blobs })
  } catch (error) {
    console.error('[v0] Error listing blobs:', error)
    return NextResponse.json(
      { error: 'Error al listar archivos' },
      { status: 500 }
    )
  }
}
