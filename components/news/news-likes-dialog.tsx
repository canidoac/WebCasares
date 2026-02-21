"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getNewsLikesList } from "@/app/actions/news-actions"
import { Users } from 'lucide-react'

interface User {
  id: number
  nombre: string
  apellido: string
  photo_url?: string
  Email: string
}

interface Like {
  id: number
  created_at: string
  user: User
}

interface NewsLikesDialogProps {
  newsId: number
  likesCount: number
}

export function NewsLikesDialog({ newsId, likesCount }: NewsLikesDialogProps) {
  const [likes, setLikes] = useState<Like[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const loadLikes = async () => {
    setLoading(true)
    try {
      const data = await getNewsLikesList(newsId)
      setLikes(data)
    } catch (error) {
      console.error('[v0] Error loading likes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadLikes()
    }
  }, [open, newsId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="text-xs">Ver likes ({likesCount})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personas que dieron like</DialogTitle>
          <DialogDescription>
            {likesCount} {likesCount === 1 ? 'persona dio' : 'personas dieron'} like a esta noticia
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : likes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay likes aún</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {likes.map((like) => (
              <div key={like.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {like.user.photo_url && (
                    <AvatarImage src={like.user.photo_url || "/placeholder.svg"} alt={`${like.user.nombre} ${like.user.apellido}`} />
                  )}
                  <AvatarFallback>
                    {like.user.nombre[0]}{like.user.apellido[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {like.user.nombre} {like.user.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground">{like.user.Email}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(like.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
