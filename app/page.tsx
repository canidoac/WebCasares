import { Navbar } from "@/components/navbar"
import { Carousel } from "@/components/carousel"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { WelcomePopup } from "@/components/welcome-popup"
import { getUser } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser, getActivePopupForUser } from "@/lib/banners-popups"
import { SponsorsCarousel } from "@/components/sponsors-carousel"
import { MatchesCarousel } from "@/components/matches-carousel"
import { ResultsCarousel } from "@/components/results-carousel"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  
  const activeBanner = await getActiveBannerForUser(user?.id, user?.id_rol)
  const activePopup = await getActivePopupForUser(user?.id, user?.id_rol)

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
      <div className="h-8 md:h-12"></div>
      <main className="flex-1">
        <section className="w-full mb-12">
          <Carousel />
        </section>
        
        <MatchesCarousel />
        <ResultsCarousel />
        
        <SponsorsCarousel />
      </main>
      <Footer user={user} />

      {activePopup && (
        <WelcomePopup
          title={activePopup.title}
          content={activePopup.message}
          image={activePopup.image_url || undefined}
          buttonText={activePopup.has_button ? activePopup.button_text : undefined}
          buttonLink={activePopup.has_button && activePopup.button_link ? activePopup.button_link : undefined}
          opacity={activePopup.opacity || 80}
        />
      )}
    </div>
  )
}
