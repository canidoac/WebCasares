import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: roles, error } = await supabase
      .from('SiteRole')
      .select('id, name, display_name, description, color')
      .order('id')

    if (error) throw error

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('[v0] Error fetching roles:', error)
    return NextResponse.json({ error: 'Error fetching roles' }, { status: 500 })
  }
}
