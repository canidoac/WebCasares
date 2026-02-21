"use client"

import React from "react"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, MapPin, Trophy, Handshake } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Match {
  id: number
  discipline_id: number
  match_date: string
  match_time: string
  rival_team: string
  match_type?: string
  status: string
  tournament?: {
    name: string
    year: number
  } | null
  location?: {
    name: string
    city: string
  } | null
  discipline: {
    name: string
    slug: string
    icon?: string
  }
}

// Formatear tiempo sin segundos
const formatTime = (time: string) => {
  if (!time) return ''
  const parts = time.split(':')
  return `${parts[0]}:${parts[1]}`
}

export function MatchesCarousel() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const fetchMatches = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from("Matches")
        .select(`
          *,
          tournament:Tournaments(name, year),
          location:Locations(name, city),
          discipline:Disciplines(name, slug, icon)
        `)
        .eq("status", "scheduled")
        .gte("match_date", today)
        .order("match_date", { ascending: true })
        .limit(10)

      if (data && data.length > 0) {
        setMatches(data)
      }
    }

    fetchMatches()
  }, [])

  // Handlers para drag scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  if (matches.length === 0) return null

  return (
    <div className="w-full bg-background py-8 border-y">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold text-center mb-6">Proximos Partidos</h3>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false)
            setIsDragging(false)
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            scrollbarWidth: 'thin'
          }}
        >
          {matches.map((match) => {
            const isAmistoso = match.match_type?.toLowerCase() === 'amistoso' || !match.tournament
            return (
              <Link
                key={match.id}
                href={`/calendario?date=${match.match_date}`}
                className="flex-shrink-0 w-80 group"
                onClick={(e) => isDragging && e.preventDefault()}
              >
                <div className="bg-card border rounded-lg p-4 hover:shadow-lg transition-all duration-300 h-full">
                  {/* Header con disciplina */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                    {isAmistoso ? (
                      <Handshake className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Trophy className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-semibold text-sm">{match.discipline.name}</span>
                  </div>

                  {/* Fecha y hora */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(match.match_date + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: es })}
                      {match.match_time && ` - ${formatTime(match.match_time)}hs`}
                    </span>
                  </div>

                  {/* Rival */}
                  <div className="mb-3">
                    <p className="text-lg font-bold text-center py-2">
                      vs {match.rival_team}
                    </p>
                    {match.match_type && (
                      <p className="text-xs text-center text-primary font-semibold uppercase bg-primary/10 rounded-full py-1 px-3 mx-auto w-fit">
                        {match.match_type}
                      </p>
                    )}
                  </div>

                  {/* Torneo */}
                  {match.tournament && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium">
                        {match.tournament.name} {match.tournament.year}
                      </span>
                    </div>
                  )}

                  {/* Ubicacion */}
                  {match.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{match.location.name}, {match.location.city}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
