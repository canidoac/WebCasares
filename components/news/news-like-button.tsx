"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from 'lucide-react'
import { toggleNewsLike } from "@/app/actions/news-actions"
import { useRouter } from 'next/navigation'
import { NewsLikesDialog } from "./news-likes-dialog"

interface NewsLikeButtonProps {
  newsId: number
  initialLikesCount: number
  initialUserHasLiked: boolean
  user: { id: string; nombre: string; apellido: string; rol_name?: string } | null
}

export function NewsLikeButton({
  newsId,
  initialLikesCount,
  initialUserHasLiked,
  user
}: NewsLikeButtonProps) {
  const router = useRouter()
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [hasLiked, setHasLiked] = useState(initialUserHasLiked)
  const [isLiking, setIsLiking] = useState(false)

  const isAdmin = user?.rol_name === 'Admin'

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (isLiking) return

    setIsLiking(true)

    // Optimistic update
    const previousState = { likesCount, hasLiked }
    setHasLiked(!hasLiked)
    setLikesCount(hasLiked ? likesCount - 1 : likesCount + 1)

    try {
      await toggleNewsLike(newsId)
    } catch (error) {
      console.error('[v0] Error toggling like:', error)
      // Revertir en caso de error
      setLikesCount(previousState.likesCount)
      setHasLiked(previousState.hasLiked)
      alert('Error al procesar el me gusta. Intenta nuevamente.')
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={hasLiked ? "default" : "outline"}
        size="lg"
        className="gap-2 transition-all"
        onClick={handleLike}
        disabled={isLiking}
      >
        <Heart
          className={`h-5 w-5 transition-all duration-300 ${
            hasLiked 
              ? 'fill-current scale-110 animate-in zoom-in-50' 
              : 'scale-100'
          }`}
        />
        <span className="font-medium">{likesCount}</span>
      </Button>
      {isAdmin && likesCount > 0 && (
        <NewsLikesDialog newsId={newsId} likesCount={likesCount} />
      )}
    </div>
  )
}
