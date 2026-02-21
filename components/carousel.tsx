"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight, Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { useClubColors } from "@/hooks/use-club-colors"
import { useTheme } from "next-themes"

// Definición de tipos para mayor claridad
interface SlideAction {
  text: string
  url: string
  icon: React.ReactNode
}

interface Slide {
  id: number
  title: string
  description: string
  image: string
  media_type?: 'image' | 'gif' | 'video' | 'youtube'
  action?: SlideAction
}

function isYouTubeUrl(url: string): boolean {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYouTubeEmbedUrl(url: string): string {
  let videoId = ''
  
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('watch?v=')[1].split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    return url
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&loop=1&playlist=${videoId}` : url
}

export function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { getColor } = useClubColors()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("News")
          .select("*")
          .eq("active", true)
          .order("display_order", { ascending: true })

        if (error) {
          console.error("Error fetching news:", error)
          return
        }

        if (data && data.length > 0) {
          const now = new Date()

          const activeNews = data.filter((item) => {
            if (item.starts_at) {
              const startDate = new Date(item.starts_at)
              if (startDate > now) return false
            }

            if (item.expires_at) {
              const expirationDate = new Date(item.expires_at)
              if (expirationDate <= now) return false
            }

            return true
          })

          const transformedSlides: Slide[] = activeNews.map((item) => {
            let detectedMediaType: 'image' | 'gif' | 'video' | 'youtube' = 'image'
            
            // Si tiene action_url con YouTube, usar ese para el embed
            if (item.action_url && isYouTubeUrl(item.action_url)) {
              detectedMediaType = 'youtube'
            } else if (item.image_url && isYouTubeUrl(item.image_url)) {
              detectedMediaType = 'youtube'
            } else if (item.image_url) {
              const url = item.image_url.toLowerCase()
              if (url.endsWith('.gif')) {
                detectedMediaType = 'gif'
              } else if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) {
                detectedMediaType = 'video'
              }
            }

            return {
              id: item.id,
              title: item.title,
              description: item.description,
              image: detectedMediaType === 'youtube' && item.action_url && isYouTubeUrl(item.action_url) 
                ? item.action_url 
                : item.image_url,
              media_type: detectedMediaType,
              action:
                item.action_text && item.action_url && !isYouTubeUrl(item.action_url)
                  ? {
                      text: item.action_text,
                      url: item.action_url,
                      icon: <MessageCircle className="mr-2 h-5 w-5" />,
                    }
                  : undefined,
            }
          })

          setSlides(transformedSlides)
        }
      } catch (error) {
        console.error("Error in fetchNews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  useEffect(() => {
    const currentSlideData = slides[currentSlide]
    if (currentSlideData?.media_type === 'video' && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      setIsVideoPlaying(true)
    } else if (currentSlideData?.media_type === 'youtube') {
      // Resetear el estado a muted cuando volvemos a un video de YouTube
      setIsMuted(true)
      setIsPlaying(true)
      setIsVideoPlaying(true)
    } else {
      setIsVideoPlaying(false)
      setIsPlaying(false)
    }
  }, [currentSlide, slides])

  useEffect(() => {
    if (slides.length === 0 || isVideoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 13000)

    return () => clearInterval(interval)
  }, [slides.length, currentSlide, isVideoPlaying])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsVideoPlaying(false)
      } else {
        videoRef.current.play()
        setIsVideoPlaying(true)
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
      if (newVolume === 0) {
        setIsMuted(true)
        videoRef.current.muted = true
      } else if (isMuted) {
        setIsMuted(false)
        videoRef.current.muted = false
      }
    }
  }

  const toggleYouTubeMute = () => {
    if (iframeRef.current) {
      const newMutedState = !isMuted
      const command = newMutedState ? '{"event":"command","func":"mute","args":""}' : '{"event":"command","func":"unMute","args":""}'
      iframeRef.current.contentWindow?.postMessage(command, '*')
      setIsMuted(newMutedState)
    }
  }

  const toggleYouTubePlayPause = () => {
    if (iframeRef.current) {
      const newPlayingState = !isPlaying
      const command = newPlayingState ? '{"event":"command","func":"playVideo","args":""}' : '{"event":"command","func":"pauseVideo","args":""}'
      iframeRef.current.contentWindow?.postMessage(command, '*')
      setIsPlaying(newPlayingState)
      setIsVideoPlaying(newPlayingState)
    }
  }

  const handleYouTubeVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value)
    setVolume(newVolume)
    if (iframeRef.current) {
      const command = `{"event":"command","func":"setVolume","args":[${newVolume}]}`
      iframeRef.current.contentWindow?.postMessage(command, '*')
      if (newVolume === 0) {
        setIsMuted(true)
        const muteCommand = '{"event":"command","func":"mute","args":""}'
        iframeRef.current.contentWindow?.postMessage(muteCommand, '*')
      } else if (isMuted) {
        setIsMuted(false)
        const unmuteCommand = '{"event":"command","func":"unMute","args":""}'
        iframeRef.current.contentWindow?.postMessage(unmuteCommand, '*')
      }
    }
  }

  const safeOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const isDarkMode = mounted && theme === 'dark'

  if (loading) {
    return (
      <div className="relative overflow-hidden w-full md:container md:mx-auto md:rounded-lg">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-muted animate-pulse flex items-center justify-center">
          <p className="text-muted-foreground">Cargando noticias...</p>
        </div>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden w-full md:container md:mx-auto md:rounded-lg">
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">No hay noticias activas en este momento.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative overflow-hidden w-full md:container md:mx-auto md:rounded-lg">
      {/* Contenedor de diapositivas */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0">
              {slide.media_type === 'video' ? (
                <>
                  <video
                    ref={index === currentSlide ? videoRef : null}
                    src={slide.image}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />
                  {/* Controles de video */}
                  {index === currentSlide && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <button
                        onClick={togglePlayPause}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </button>
                      {!isMobile && (
                        <>
                          <button
                            onClick={toggleMute}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                          >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </button>
                          <div className="bg-black/50 hover:bg-black/70 text-white px-3 rounded-full transition-colors flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-20 accent-white"
                              aria-label="Control de volumen"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : slide.media_type === 'youtube' ? (
                <div className="relative w-full h-full">
                  <iframe
                    ref={index === currentSlide ? iframeRef : null}
                    src={index === currentSlide ? `${getYouTubeEmbedUrl(slide.image)}&enablejsapi=1` : 'about:blank'}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={slide.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Controles de YouTube */}
                  {index === currentSlide && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20 pointer-events-auto">
                      <button
                        onClick={toggleYouTubePlayPause}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </button>
                      {!isMobile && (
                        <>
                          <button
                            onClick={toggleYouTubeMute}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                          >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </button>
                          <div className="bg-black/50 hover:bg-black/70 text-white px-3 rounded-full transition-colors flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={handleYouTubeVolumeChange}
                              className="w-20 accent-white"
                              aria-label="Control de volumen"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Image
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    unoptimized={slide.media_type === 'gif'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                </>
              )}
            </div>

            {/* Contenido de la diapositiva */}
            <div className="absolute bottom-12 sm:bottom-0 left-0 right-0 p-6 md:p-10 text-white z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-2 text-shadow-xl drop-shadow-lg">{slide.title}</h2>
              <p className="text-lg md:text-xl mb-4 text-shadow-lg max-w-3xl line-clamp-2">{slide.description}</p>

              <div className="flex gap-3 flex-wrap">
                <Link href={`/noticias/${slide.id}-${slugify(slide.title)}`}>
                  <button 
                    className="flex items-center shadow-md rounded-md px-4 py-2 font-medium transition-all hover:brightness-110"
                    style={{
                      backgroundColor: isDarkMode 
                        ? getColor('amarillo', '#ffd700') 
                        : getColor('verde', '#2e8b58'),
                      color: isDarkMode ? '#000000' : '#ffffff'
                    }}
                  >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Leer Más
                  </button>
                </Link>

                {slide.action && (
                  <button
                    className="flex items-center shadow-md rounded-md px-4 py-2 font-medium transition-all hover:brightness-110"
                    onClick={() => safeOpenLink(slide.action.url)}
                    style={{
                      backgroundColor: isDarkMode 
                        ? getColor('amarillo', '#ffd700') 
                        : getColor('verde', '#2e8b58'),
                      color: isDarkMode ? '#000000' : '#ffffff'
                    }}
                  >
                    {slide.action.icon}
                    {slide.action.text}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full p-2 z-20"
        onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full p-2 z-20"
        onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicadores de diapositiva */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full shadow-md transition-colors`}
            style={{
              backgroundColor: index === currentSlide 
                ? getColor('amarillo', '#f4d03f')
                : getColor('verde', '#2e8b58')
            }}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
