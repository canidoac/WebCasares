"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import Image from "next/image"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { autoSwitchToOnline } from "@/app/actions/auto-switch-status"

interface MaintenancePageProps {
  title: string
  message: string
  mediaType?: "none" | "image" | "video"
  mediaUrl?: string
  showCountdown?: boolean
  launchDate?: string
  redirectUrl?: string
  finalVideoUrl?: string
  autoSwitchToOnline?: boolean
}

export function MaintenancePage({
  title,
  message,
  mediaType = "none",
  mediaUrl,
  showCountdown = false,
  launchDate,
  redirectUrl,
  finalVideoUrl,
  autoSwitchToOnline: shouldAutoSwitch = false,
}: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState<{
    months: number
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const router = useRouter()
  const hasFinishedRef = useRef(false)

  useEffect(() => {
    if (!showCountdown || !launchDate) {
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(launchDate).getTime()
      const difference = target - now

      if (difference > 0) {
        const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30))
        const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30)
        
        return {
          months,
          days,
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true
        
        if (shouldAutoSwitch) {
          autoSwitchToOnline()
            .then((result) => {
              if (!result.success) {
                console.error("[v0] Auto-switch failed:", result.error)
              }
              
              setTimeout(() => {
                if (finalVideoUrl) {
                  router.push("/coming-soon/video")
                } else if (redirectUrl) {
                  window.location.href = redirectUrl
                } else {
                  window.location.reload()
                }
              }, 1000)
            })
            .catch((error) => {
              console.error("[v0] Auto-switch error:", error)
              if (finalVideoUrl) {
                router.push("/coming-soon/video")
              } else if (redirectUrl) {
                window.location.href = redirectUrl
              } else {
                window.location.reload()
              }
            })
        } else {
          if (finalVideoUrl) {
            router.push("/coming-soon/video")
          } else if (redirectUrl) {
            window.location.href = redirectUrl
          } else {
            window.location.reload()
          }
        }
      }
      
      return null
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [showCountdown, launchDate, finalVideoUrl, redirectUrl, shouldAutoSwitch, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {mediaType === "image" && mediaUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl mb-8">
            <Image src={mediaUrl || "/placeholder.svg"} alt="Maintenance" fill className="object-cover" />
          </div>
        )}

        {mediaType === "video" && mediaUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl mb-8">
            <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            <Image src="/images/logo-club.png" alt="Logo" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-foreground mb-4">{title}</h1>

        <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">{message}</p>

        {showCountdown && timeLeft && (
          <div className="mt-12">
            <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Lanzamiento en:</span>
            </div>

            <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
              {[
                { label: "Meses", value: timeLeft.months },
                { label: "Días", value: timeLeft.days },
                { label: "Horas", value: timeLeft.hours },
                { label: "Minutos", value: timeLeft.minutes },
                { label: "Segundos", value: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-card border rounded-lg p-3 shadow-lg">
                  <div className="text-3xl font-bold text-primary mb-1">{String(item.value).padStart(2, "0")}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-12 text-sm text-muted-foreground">
          <p>Gracias por tu paciencia</p>
        </div>
      </div>
    </div>
  )
}
