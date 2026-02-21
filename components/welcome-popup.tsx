"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from 'next/navigation'

interface WelcomePopupProps {
  title: string
  content: string
  image?: string
  mediaType?: 'image' | 'gif' | 'video'
  videoAutoplay?: boolean
  videoMuted?: boolean
  buttonText?: string
  buttonLink?: string
  opacity?: number
  forceOpen?: boolean
  onClose?: () => void
}

export function WelcomePopup({
  title,
  content,
  image,
  mediaType = 'image',
  videoAutoplay = false,
  videoMuted = true,
  buttonText,
  buttonLink,
  opacity = 80,
  forceOpen = false,
  onClose,
}: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      return
    }

    if (pathname === "/") {
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [forceOpen, pathname])

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    } else {
      setIsOpen(true)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = ''
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      return url
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}${videoAutoplay ? '?autoplay=1&mute=' + (videoMuted ? '1' : '0') : ''}` : url
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" overlayOpacity={opacity}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
        {image && (
          <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted">
            {mediaType === 'video' ? (
              (image.includes('youtube.com') || image.includes('youtu.be')) ? (
                <iframe
                  src={getYouTubeEmbedUrl(image)}
                  className="w-full h-full"
                  allowFullScreen
                  allow={videoAutoplay ? "autoplay" : ""}
                  title={title}
                />
              ) : (
                <video 
                  src={image} 
                  controls 
                  autoPlay={videoAutoplay}
                  muted={videoMuted}
                  className="w-full h-full object-contain"
                >
                  Tu navegador no soporta video.
                </video>
              )
            ) : (
              <Image 
                src={image || "/placeholder.svg"} 
                alt={title} 
                fill 
                className="object-cover"
                unoptimized={mediaType === 'gif'}
              />
            )}
          </div>
        )}
        {buttonText && (
          <div className="flex gap-2 justify-end">
            {buttonLink ? (
              <Link href={buttonLink} onClick={handleClose}>
                <Button>{buttonText}</Button>
              </Link>
            ) : (
              <Button onClick={handleClose}>{buttonText}</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
