import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { getUser } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser } from "@/lib/banners-popups"
import { ClubHistory } from "@/components/club/club-history"
import { BoardMembers } from "@/components/club/board-members"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getClubInfo() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ClubInfo')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('[v0] Error fetching club info:', error)
    return null
  }

  return data
}

async function getBoardMembers() {
  const supabase = await createClient()
  
  // Obtener todos los miembros activos del board
  const { data: members, error: membersError } = await supabase
    .from('BoardMembers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (membersError) {
    console.error('[v0] Error fetching board members:', membersError)
    return []
  }

  if (!members || members.length === 0) {
    return []
  }

  // Obtener los IDs de usuarios vinculados
  const userIds = members
    .filter(m => m.user_id)
    .map(m => m.user_id)

  if (userIds.length === 0) {
    return members
  }

  // Obtener los datos de los usuarios
  const { data: users, error: usersError } = await supabase
    .from('User')
    .select('id, NOMBRE, APELLIDO, photo_url, display_name')
    .in('id', userIds)

  if (usersError) {
    console.error('[v0] Error fetching users:', usersError)
    return members
  }

  // Combinar los datos
  const membersWithUsers = members.map(member => ({
    ...member,
    user: member.user_id 
      ? users?.find(u => u.id === member.user_id) || null
      : null
  }))

  return membersWithUsers
}

export default async function ClubPage() {
  const user = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const activeBanner = await getActiveBannerForUser(user?.id, user?.id_rol)
  
  const clubInfo = await getClubInfo()
  const boardMembers = await getBoardMembers()

  return (
    <div className="flex min-h-screen flex-col">
      {activeBanner && (
        <SiteBanner
          text={activeBanner.message}
          link={activeBanner.link_url || undefined}
          buttonText={activeBanner.button_text || "Ir"}
          showButton={activeBanner.show_button && !!activeBanner.link_url}
          color={activeBanner.bg_color_light}
          textColor={activeBanner.text_color_light}
          colorDark={activeBanner.bg_color_dark}
          textColorDark={activeBanner.text_color_dark}
          buttonColor={activeBanner.button_bg_color_light}
          buttonColorDark={activeBanner.button_bg_color_dark}
          buttonTextColor={activeBanner.button_text_color_light}
          buttonTextColorDark={activeBanner.button_text_color_dark}
        />
      )}

      <Navbar user={user} config={config} navbarItems={navbarItems} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Club Carlos Casares
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Más que un club deportivo, un hogar para todos los casarenses
              </p>
            </div>
          </div>
        </section>

        {/* Nuestra Historia Section */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                {clubInfo?.history_title || 'Nuestra Historia'}
              </h2>
            </div>
            
            <ClubHistory
              content={clubInfo?.history_content}
              imageUrl={clubInfo?.history_image_url}
            />
          </div>
        </section>

        {/* Comisión Directiva Section */}
        <section className="w-full py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Comisión Directiva
              </h2>
            </div>
            
            <BoardMembers members={boardMembers} />
          </div>
        </section>
      </main>

      <Footer user={user} />
    </div>
  )
}
