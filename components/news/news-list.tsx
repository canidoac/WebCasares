"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, Play } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { toggleNewsLike } from "@/app/actions/news-actions"
import { useRouter } from 'next/navigation'
import { slugify } from "@/lib/utils"

interface NewsItem {
  id: number
  title: string
  description: string
  image_url: string
  media_type?: string
  thumbnail_url?: string
  action_text: string | null
  action_url: string | null
  created_at: string
  likesCount: number
  commentsCount: number
  userHasLiked: boolean
}

interface User {
  id: string
  nombre: string
  apellido: string
}

interface NewsListProps {
  news: NewsItem[]
  user: User | null
}

export function NewsList({ news, user }: NewsListProps) {
  const router = useRouter()
  const [expandedComments, setExpandedComments] = useState<number | null>(null)
  
  const [localLikes, setLocalLikes] = useState<Record<number, { count: number, hasLiked: boolean }>>({})
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set())

  const handleLike = async (newsId: number) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (likingIds.has(newsId)) return
    
    setLikingIds(prev => new Set(prev).add(newsId))

    const currentState = localLikes[newsId] || {
      count: news.find(n => n.id === newsId)?.likesCount || 0,
      hasLiked: news.find(n => n.id === newsId)?.userHasLiked || false
    }

    setLocalLikes(prev => ({
      ...prev,
      [newsId]: {
        count: currentState.hasLiked ? currentState.count - 1 : currentState.count + 1,
        hasLiked: !currentState.hasLiked
      }
    }))

    try {
      await toggleNewsLike(newsId)
    } catch (error) {
      console.error('[v0] Error toggling like:', error)
      setLocalLikes(prev => ({
        ...prev,
        [newsId]: currentState
      }))
      alert('Error al procesar el me gusta. Intenta nuevamente.')
    } finally {
      setLikingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(newsId)
        return newSet
      })
    }
  }

  const handleCommentClick = (newsId: number) => {
    if (!user) {
      router.push('/login')
      return
    }
    setExpandedComments(expandedComments === newsId ? null : newsId)
  }

  const getLikeState = (item: NewsItem) => {
    return localLikes[item.id] || {
      count: item.likesCount,
      hasLiked: item.userHasLiked
    }
  }

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No hay noticias disponibles en este momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => {
        const likeState = getLikeState(item)
        const newsSlug = `${item.id}-${slugify(item.title)}`
        const isVideo = item.media_type === 'video' || item.media_type === 'youtube'
        const displayImage = isVideo && item.thumbnail_url ? item.thumbnail_url : item.image_url
        
        return (
          <Link key={item.id} href={`/noticias/${newsSlug}`}>
            <Card 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full"
            >
              <CardHeader className="p-0">
                <div className="relative w-full h-[200px]">
                  <Image
                    src={displayImage || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="bg-primary/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-primary-foreground fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-2">
                <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(item.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {item.description}
                </p>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex items-center gap-3">
                <Button
                  variant={likeState.hasLiked ? "default" : "ghost"}
                  size="sm"
                  className="gap-1 h-8 transition-all"
                  onClick={(e) => {
                    e.preventDefault()
                    handleLike(item.id)
                  }}
                  disabled={likingIds.has(item.id)}
                >
                  <Heart 
                    className={`h-3 w-3 transition-all duration-300 ${
                      likeState.hasLiked 
                        ? 'fill-current scale-110 animate-in zoom-in-50' 
                        : 'scale-100'
                    }`} 
                  />
                  <span className="text-xs">{likeState.count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-8"
                  onClick={(e) => e.preventDefault()}
                >
                  <MessageCircle className="h-3 w-3" />
                  <span className="text-xs">{item.commentsCount}</span>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
