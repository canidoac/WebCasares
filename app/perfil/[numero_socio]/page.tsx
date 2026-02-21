import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { getUser } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser } from "@/lib/banners-popups"
import { createClient } from "@/lib/supabase/server"
import { notFound } from 'next/navigation'
import { User, Mail, Calendar, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getUserProfile(numeroSocio: string) {
  if (!numeroSocio || numeroSocio === 'undefined' || numeroSocio === 'null') {
    return null
  }

  const supabase = await createClient()
  
  const { data: profiles, error } = await supabase
    .from('User')
    .select(`
      id,
      NOMBRE,
      APELLIDO,
      Email,
      display_name,
      photo_url,
      socio_number,
      created_at,
      rol:SiteRole(
        name,
        color
      )
    `)
    .eq('socio_number', numeroSocio)
    .limit(1)

  const userProfile = profiles?.[0]

  if (error || !userProfile) {
    return null
  }

  // Obtener disciplinas donde es jugador
  const { data: playerDisciplines } = await supabase
    .from('DisciplinePlayers')
    .select(`
      id,
      position,
      jersey_number,
      discipline:Disciplines(
        id,
        name,
        slug
      )
    `)
    .eq('user_id', userProfile.id)
    .eq('is_active', true)

  // Obtener disciplinas donde es staff
  const { data: staffDisciplines } = await supabase
    .from('DisciplineStaff')
    .select(`
      id,
      role,
      discipline:Disciplines(
        id,
        name,
        slug
      )
    `)
    .eq('user_id', userProfile.id)

  return {
    ...userProfile,
    playerDisciplines: playerDisciplines || [],
    staffDisciplines: staffDisciplines || []
  }
}

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ numero_socio: string }>
}) {
  const { numero_socio } = await params
  const currentUser = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const activeBanner = await getActiveBannerForUser(currentUser?.id, currentUser?.id_rol)
  
  const userProfile = await getUserProfile(numero_socio)

  if (!userProfile) {
    notFound()
  }

  const displayName = userProfile.display_name || `${userProfile.NOMBRE} ${userProfile.APELLIDO}`
  const initials = `${userProfile.NOMBRE.charAt(0)}${userProfile.APELLIDO.charAt(0)}`.toUpperCase()

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

      <Navbar user={currentUser} config={config} navbarItems={navbarItems} />
      
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={userProfile.photo_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                  <p className="text-muted-foreground mb-2">
                    {userProfile.NOMBRE} {userProfile.APELLIDO}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Socio N° {userProfile.socio_number}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {userProfile.rol && (
                      <Badge 
                        style={{ backgroundColor: userProfile.rol.color }}
                        className="text-white"
                      >
                        {userProfile.rol.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Disciplines as Player */}
            {userProfile.playerDisciplines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Disciplinas (Jugador)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userProfile.playerDisciplines.map((pd: any) => (
                      <Link 
                        key={pd.discipline.id} 
                        href={`/disciplinas/${pd.discipline.slug}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{pd.discipline.name}</p>
                            {pd.position && (
                              <p className="text-sm text-muted-foreground">{pd.position}</p>
                            )}
                          </div>
                          {pd.jersey_number && (
                            <Badge variant="outline">#{pd.jersey_number}</Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Disciplines as Staff */}
            {userProfile.staffDisciplines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cuerpo Técnico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userProfile.staffDisciplines.map((sd: any) => (
                      <Link 
                        key={sd.discipline.id} 
                        href={`/disciplinas/${sd.discipline.slug}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <p className="font-semibold">{sd.discipline.name}</p>
                        <p className="text-sm text-muted-foreground">{sd.role}</p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer user={currentUser} />
    </div>
  )
}
