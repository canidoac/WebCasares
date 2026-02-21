import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { getUser } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser } from "@/lib/banners-popups"
import { DisciplinesGrid } from "@/components/disciplines/disciplines-grid"
import { createClient } from "@/lib/supabase/server"
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDisciplines() {
  const supabase = await createClient()
  
  const { data: disciplines, error: disciplinesError } = await supabase
    .from('Disciplines')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (disciplinesError) {
    console.error('[v0] Error fetching disciplines:', disciplinesError)
    return []
  }

  if (!disciplines) return []

  // Obtener imágenes y staff por separado para cada disciplina
  const disciplinesWithDetails = await Promise.all(
    disciplines.map(async (discipline) => {
      // Obtener imágenes
      const { data: images } = await supabase
        .from('DisciplineImages')
        .select('id, image_url, caption, display_order')
        .eq('discipline_id', discipline.id)
        .order('display_order', { ascending: true })

      // Obtener staff
      const { data: staff } = await supabase
        .from('DisciplineStaff')
        .select('id, role, name, display_order')
        .eq('discipline_id', discipline.id)
        .order('display_order', { ascending: true })

      return {
        ...discipline,
        images: images || [],
        staff: staff || []
      }
    })
  )

  console.log('[v0] Disciplines loaded:', disciplinesWithDetails.length)
  return disciplinesWithDetails
}

export default async function DisciplinasPage() {
  const user = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const activeBanner = await getActiveBannerForUser(user?.id, user?.id_rol)
  
  const disciplines = await getDisciplines()

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
              <div className="flex items-center gap-3">
                <Trophy className="h-12 w-12 text-primary" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Nuestras Disciplinas
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Explora la información y las imágenes de la disciplina.
              </p>
            </div>
          </div>
        </section>

        {/* Disciplines Grid */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <DisciplinesGrid disciplines={disciplines} />
          </div>
        </section>
      </main>

      <Footer user={user} />
    </div>
  )
}
