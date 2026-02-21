import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SiteBanner } from "@/components/site-banner"
import { getUser } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { getActiveBannerForUser } from "@/lib/banners-popups"
import { NewsList } from "@/components/news/news-list"
import { createClient } from "@/lib/supabase/server"
import { Newspaper } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getNewsWithStats(userId?: string) {
  const supabase = await createClient()
  
  const { data: news, error: newsError } = await supabase
    .from('News')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (newsError) {
    console.error('[v0] Error fetching news:', newsError)
    return []
  }

  // Process data to add counts including likes
  const processedNews = await Promise.all((news || []).map(async (item) => {
    // Count likes
    const { count: likesCount } = await supabase
      .from('NewsLikes')
      .select('*', { count: 'exact', head: true })
      .eq('news_id', item.id)

    // Count comments
    const { count: commentsCount } = await supabase
      .from('NewsComments')
      .select('*', { count: 'exact', head: true })
      .eq('news_id', item.id)

    // Check if user liked this news
    let userHasLiked = false
    if (userId) {
      const { data: userLike } = await supabase
        .from('NewsLikes')
        .select('id')
        .eq('news_id', item.id)
        .eq('user_id', userId)
        .maybeSingle()
      
      userHasLiked = !!userLike
    }

    return {
      ...item,
      likesCount: likesCount || 0,
      commentsCount: commentsCount || 0,
      userHasLiked,
    }
  }))

  return processedNews
}

export default async function NoticiasPage() {
  const user = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const activeBanner = await getActiveBannerForUser(user?.id, user?.id_rol)
  
  const news = await getNewsWithStats(user?.id)

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
                <Newspaper className="h-12 w-12 text-primary" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Noticias
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Mantente al día con todas las novedades del club
              </p>
            </div>
          </div>
        </section>

        {/* News List */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <NewsList news={news} user={user} />
          </div>
        </section>
      </main>

      <Footer user={user} />
    </div>
  )
}
