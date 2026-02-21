"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Sponsor {
  id: number
  name: string
  logo_url: string
  website_url?: string
  display_order: number
}

export function SponsorsCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchSponsors = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("Sponsors")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true })

      if (data) {
        // Duplicar sponsors para efecto infinito
        setSponsors([...data, ...data])
      }
    }

    fetchSponsors()
  }, [])

  if (sponsors.length === 0) return null

  const handleSponsorClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="w-full bg-muted py-8 border-t">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold text-center mb-6">Nuestros Sponsors</h3>
        
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex gap-8 animate-scroll"
            style={{
              width: 'max-content',
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {sponsors.map((sponsor, index) => (
              <div
                key={`${sponsor.id}-${index}`}
                className={`flex-shrink-0 h-20 w-32 relative grayscale hover:grayscale-0 transition-all duration-300 ${
                  sponsor.website_url ? 'cursor-pointer' : ''
                }`}
                onClick={() => handleSponsorClick(sponsor.website_url)}
              >
                <div className="absolute inset-0 bg-white rounded-lg p-3 shadow-sm">
                  <Image
                    src={sponsor.logo_url || "/placeholder.svg"}
                    alt={sponsor.name}
                    fill
                    className="object-contain !relative !w-full !h-full"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
