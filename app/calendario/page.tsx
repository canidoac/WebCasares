import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { getUser, canManageCalendar } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser } from "@/lib/banners-popups"
import { CalendarComponent } from "@/components/calendar-component"
import { Calendar as CalendarIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function CalendarioPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialDate = params.date || undefined
  const user = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const activeBanner = await getActiveBannerForUser(user?.id, user?.id_rol)
  const calendarPermissions = await canManageCalendar()

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
                <CalendarIcon className="h-12 w-12 text-primary" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Calendario Deportivo
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Todos los partidos y resultados del Club Carlos Casares
              </p>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="w-full py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <CalendarComponent 
              user={user} 
              initialDate={initialDate} 
              canManage={calendarPermissions.canManage}
              managedDisciplineIds={calendarPermissions.managedDisciplineIds}
            />
          </div>
        </section>
      </main>

      <Footer user={user} />
    </div>
  )
}
