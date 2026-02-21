import { createServerClient } from "@/lib/supabase/server"
import { notFound } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft } from 'lucide-react'
import { NewsComments } from "@/components/news/news-comments"
import { NewsLikeButton } from "@/components/news/news-like-button"
import { parseNewsSlug } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getUser } from "@/lib/auth"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

async function getNewsById(id: string) {
  const supabase = await createServerClient()
  
  const { data: news, error } = await supabase
    .from('News')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !news) {
    return null
  }

  const { data: images } = await supabase
    .from('NewsImages')
    .select('*')
    .eq('news_id', id)
    .order('position', { ascending: true })

  return { ...news, images: images || [] }
}

async function getUserData() {
  const user = await getUser()
  
  if (!user) return null

  return {
    id: user.id.toString(),
    nombre: user.nombre || '',
    apellido: user.apellido || ''
  }
}

async function getNewsStats(newsId: string, userId: string | null) {
  const supabase = await createServerClient()
  
  const { count: likesCount } = await supabase
    .from('NewsLikes')
    .select('*', { count: 'exact', head: true })
    .eq('news_id', newsId)

  const { count: commentsCount } = await supabase
    .from('NewsComments')
    .select('*', { count: 'exact', head: true })
    .eq('news_id', newsId)

  let userHasLiked = false
  if (userId) {
    const { data } = await supabase
      .from('NewsLikes')
      .select('id')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .maybeSingle()

    userHasLiked = !!data
  }

  return {
    likesCount: likesCount || 0,
    commentsCount: commentsCount || 0,
    userHasLiked
  }
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsId = parseNewsSlug(params.id) || parseInt(params.id)
  
  if (isNaN(newsId)) {
    notFound()
  }

  const news = await getNewsById(newsId.toString())
  
  if (!news) {
    notFound()
  }

  const user = await getUserData()
  const currentUser = await getUser()
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()
  const stats = await getNewsStats(newsId.toString(), user?.id || null)

  const images = news.images?.map(img => img.image_url) || [news.image_url].filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={currentUser} config={config} navbarItems={navbarItems} />
      
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Link href="/noticias">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a noticias
            </Button>
          </Link>

          <article className="space-y-6">
            {images.length > 0 && (
              <div className="relative w-full">
                {images.length === 1 ? (
                  <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src={images[0] || "/placeholder.svg"}
                      alt={news.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {images.map((img, index) => (
                        <CarouselItem key={index}>
                          <div className="relative w-full h-[400px] md:h-[500px]">
                            <Image
                              src={img || "/placeholder.svg"}
                              alt={`${news.title} - Imagen ${index + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {news.title}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={news.created_at}>
                  {new Date(news.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              {news.content_html ? (
                <div dangerouslySetInnerHTML={{ __html: news.content_html }} />
              ) : (
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {news.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 py-6 border-y">
              <NewsLikeButton
                newsId={newsId}
                initialLikesCount={stats.likesCount}
                initialUserHasLiked={stats.userHasLiked}
                user={user}
              />
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-medium">{stats.commentsCount}</span>
                <span className="text-sm">comentarios</span>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Comentarios</h2>
              {news.comments_locked ? (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">
                    Los comentarios están deshabilitados para esta noticia
                  </p>
                </div>
              ) : user ? (
                <NewsComments newsId={newsId} user={user} />
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-4">
                    Inicia sesión para dejar un comentario
                  </p>
                  <Link href="/login">
                    <Button>Iniciar sesión</Button>
                  </Link>
                </div>
              )}
            </div>
          </article>
        </div>
      </main>
      
      <Footer user={currentUser} />
    </div>
  )
}
