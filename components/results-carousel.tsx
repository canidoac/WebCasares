"use client"

import React from "react"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Trophy, Handshake } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface MatchResult {
  id: number
  discipline_id: number
  match_date: string
  rival_team: string
  match_type?: string
  status: string
  tournament?: {
    name: string
    year: number
  } | null
  discipline: {
    name: string
    slug: string
    icon?: string
  }
  result?: {
    our_score: number
    rival_score: number
    scorers?: string[]
  } | null
}

export function ResultsCarousel() {
  const [results, setResults] = useState<MatchResult[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const fetchResults = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("Matches")
        .select(`
          *,
          tournament:Tournaments(name, year),
          discipline:Disciplines(name, slug, icon),
          result:MatchResults(our_score, rival_score, scorers)
        `)
        .eq("status", "completed")
        .order("match_date", { ascending: false })
        .limit(10)

      if (data && data.length > 0) {
        const formattedData = data.map(match => ({
          ...match,
          result: Array.isArray(match.result) ? match.result[0] : match.result
        }))
        setResults(formattedData)
      }
    }

    fetchResults()
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

  if (results.length === 0) return null

  const getResultColor = (ourScore?: number, rivalScore?: number) => {
    if (ourScore === undefined || rivalScore === undefined) return "text-muted-foreground"
    if (ourScore > rivalScore) return "text-green-600 dark:text-green-400"
    if (ourScore < rivalScore) return "text-red-600 dark:text-red-400"
    return "text-yellow-600 dark:text-yellow-400"
  }

  const getResultText = (ourScore?: number, rivalScore?: number) => {
    if (ourScore === undefined || rivalScore === undefined) return ""
    if (ourScore > rivalScore) return "Victoria"
    if (ourScore < rivalScore) return "Derrota"
    return "Empate"
  }

  return (
    <div className="w-full bg-muted/50 py-8 border-y">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold text-center mb-6">Ultimos Resultados</h3>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsDragging(false)}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            scrollbarWidth: 'thin'
          }}
        >
          {results.map((match) => {
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

                  {/* Fecha */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(match.match_date + 'T12:00:00'), "dd 'de' MMMM", { locale: es })}
                    </span>
                  </div>

                  {/* Marcador */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center gap-4 py-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{match.result?.our_score ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">Club</p>
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">:</div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{match.result?.rival_score ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{match.rival_team}</p>
                      </div>
                    </div>
                    
                    {/* Resultado */}
                    <p className={`text-center font-semibold ${getResultColor(match.result?.our_score, match.result?.rival_score)}`}>
                      {getResultText(match.result?.our_score, match.result?.rival_score)}
                    </p>

                    {match.match_type && (
                      <p className="text-xs text-center text-primary font-semibold uppercase bg-primary/10 rounded-full py-1 px-3 mx-auto w-fit mt-2">
                        {match.match_type}
                      </p>
                    )}
                  </div>

                  {/* Torneo */}
                  {match.tournament && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium">
                        {match.tournament.name} {match.tournament.year}
                      </span>
                    </div>
                  )}

                  {/* Goleadores - formato string[] */}
                  {match.result?.scorers && match.result.scorers.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Goleadores:</p>
                      <div className="space-y-0.5">
                        {match.result.scorers.map((scorer, idx) => (
                          <p key={idx} className="text-sm">
                            {scorer}
                          </p>
                        ))}
                      </div>
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
