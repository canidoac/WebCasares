"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, ExternalLink, Calendar } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { NewsComments } from "./news-comments"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NewsItem {
  id: number
  title: string
  description: string
  image_url: string
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

interface NewsModalProps {
  news: NewsItem
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLike: (newsId: number) => void
}

export function NewsModal({ news, user, open, onOpenChange, onLike }: NewsModalProps) {
  const [showComments, setShowComments] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image
              src={news.image_url || "/placeholder.svg"}
              alt={news.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl md:text-4xl font-bold">
                {news.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(news.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </DialogHeader>

            <div className="prose prose-sm md:prose-base max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                {news.description}
              </p>
            </div>

            {news.action_text && news.action_url && (
              <Link href={news.action_url} target="_blank">
                <Button className="gap-2">
                  {news.action_text}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant={news.userHasLiked ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => onLike(news.id)}
              >
                <Heart className={`h-4 w-4 ${news.userHasLiked ? 'fill-current' : ''}`} />
                <span>{news.likesCount}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{news.commentsCount}</span>
              </Button>
            </div>

            {showComments && user && (
              <div className="pt-4 border-t">
                <NewsComments newsId={news.id} user={user} />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
