"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

interface CountdownVideoProps {
  videoUrl: string
  redirectUrl: string
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // ID directo
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export function CountdownVideo({ videoUrl, redirectUrl }: CountdownVideoProps) {
  const [showButton, setShowButton] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const router = useRouter()
  
  const youtubeId = getYouTubeVideoId(videoUrl)
  const isYouTube = youtubeId !== null

  useEffect(() => {
    console.log("[v0] Video component mounted")
    console.log("[v0] Video URL:", videoUrl)
    console.log("[v0] Is YouTube:", isYouTube)
    console.log("[v0] YouTube ID:", youtubeId)

    if (isYouTube) {
      // Escuchar mensajes del iframe de YouTube
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://www.youtube.com') return
        
        try {
          const data = JSON.parse(event.data)
          console.log("[v0] YouTube message:", data)
          
          // YouTube IFrame API envía eventos
          if (data.event === 'onStateChange') {
            // 0 = ended
            if (data.info === 0) {
              console.log("[v0] YouTube video ended")
              setShowButton(true)
            }
          }
        } catch (e) {
          // Ignorar mensajes que no sean JSON
        }
      }

      window.addEventListener('message', handleMessage)
      
      // Mostrar botón después de 30 segundos como fallback
      const fallbackTimer = setTimeout(() => {
        console.log("[v0] Fallback timer: showing button")
        setShowButton(true)
      }, 30000)

      return () => {
        window.removeEventListener('message', handleMessage)
        clearTimeout(fallbackTimer)
      }
    } else {
      const video = document.getElementById('direct-video') as HTMLVideoElement
      if (!video) return

      const handleEnded = () => {
        console.log("[v0] Video ended")
        setShowButton(true)
      }

      const handleError = (e: Event) => {
        console.error("[v0] Video error:", e)
        setVideoError(true)
        setShowButton(true)
      }

      const handleLoadedMetadata = () => {
        console.log("[v0] Video metadata loaded, duration:", video.duration)
      }

      video.addEventListener("ended", handleEnded)
      video.addEventListener("error", handleError)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      
      return () => {
        video.removeEventListener("ended", handleEnded)
        video.removeEventListener("error", handleError)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [videoUrl, isYouTube, youtubeId])

  const handleRedirect = () => {
    console.log("[v0] Redirecting to:", redirectUrl)
    router.push(redirectUrl)
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {videoError ? (
        <div className="text-white text-center">
          <p className="text-xl mb-4">No se pudo cargar el video</p>
          <Button onClick={handleRedirect}>
            Continuar al sitio
          </Button>
        </div>
      ) : (
        <>
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          ) : (
            <video
              id="direct-video"
              src={videoUrl}
              autoPlay
              playsInline
              controls
              className="w-full h-full object-contain"
            />
          )}
          
          {showButton && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
              <Button
                size="lg"
                onClick={handleRedirect}
                className="text-lg px-8 py-6"
              >
                Continuar al sitio
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
