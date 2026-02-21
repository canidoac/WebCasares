"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { addNewsComment, getNewsComments, deleteNewsComment, toggleCommentLike } from "@/app/actions/news-actions"
import { useRouter } from 'next/navigation'
import { Heart, Trash2 } from 'lucide-react'
import { formatRelativeTime, formatFullDateTime } from "@/lib/utils"

interface User {
  id: string
  nombre: string
  apellido: string
}

interface Comment {
  id: number
  comment: string
  created_at: string
  user_id: number
  user: {
    id: number
    nombre: string
    apellido: string
    photo_url?: string
    display_name?: string
  }
  likesCount: number
  userLiked: boolean
}

interface NewsCommentsProps {
  newsId: number
  user: User
}

export function NewsComments({ newsId, user }: NewsCommentsProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [newsId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await getNewsComments(newsId)
      setComments(data)
    } catch (error) {
      console.error('[v0] Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await addNewsComment(newsId, newComment)
      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error('[v0] Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return

    try {
      await deleteNewsComment(commentId)
      await loadComments()
    } catch (error) {
      console.error('[v0] Error deleting comment:', error)
      alert("Error al eliminar el comentario")
    }
  }

  const handleLike = async (commentId: number) => {
    try {
      // Optimistic update
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, userLiked: !c.userLiked, likesCount: c.userLiked ? c.likesCount - 1 : c.likesCount + 1 }
          : c
      ))

      await toggleCommentLike(commentId)
    } catch (error) {
      console.error('[v0] Error toggling comment like:', error)
      await loadComments()
    }
  }

  return (
    <div className="w-full space-y-4 border-t pt-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button type="submit" disabled={!newComment.trim() || submitting}>
          {submitting ? "Publicando..." : "Publicar comentario"}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay comentarios aún. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    {comment.user?.photo_url && (
                      <AvatarImage src={comment.user.photo_url || "/placeholder.svg"} alt={`${comment.user.nombre} ${comment.user.apellido}`} />
                    )}
                    <AvatarFallback>
                      {comment.user?.nombre?.[0]?.toUpperCase() || 'U'}{comment.user?.apellido?.[0]?.toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {comment.user?.display_name || `${comment.user?.nombre || 'Usuario'} ${comment.user?.apellido || ''}`}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-help">
                                {formatRelativeTime(comment.created_at)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{formatFullDateTime(comment.created_at)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {user && comment.user_id === parseInt(user.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment.id)}
                        className="h-8 gap-1 px-2"
                      >
                        <Heart 
                          className={`h-4 w-4 transition-all ${
                            comment.userLiked 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span className="text-xs">{comment.likesCount}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
