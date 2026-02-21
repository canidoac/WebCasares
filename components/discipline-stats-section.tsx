"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Tournament {
  id: number
  name: string
  year?: number
  last_scraped_at?: string
}

interface Standing {
  id: number
  position: number
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

interface Scorer {
  id: number
  name: string
  goals: number
  photo_url?: string
  socio_number?: string
}

interface PlayerMatches {
  id: number
  name: string
  matches_played: number
  photo_url?: string
  socio_number?: string
}

interface DisciplineStatsSectionProps {
  disciplineId: number
  tournaments: Tournament[]
  initialTournamentId?: number
  initialStandings?: Standing[]
  initialTopScorers?: Scorer[]
  initialMostMatches?: PlayerMatches[]
}

export function DisciplineStatsSection({
  disciplineId,
  tournaments,
  initialTournamentId,
  initialStandings = [],
  initialTopScorers = [],
  initialMostMatches = [],
}: DisciplineStatsSectionProps) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | undefined>(initialTournamentId)
  const [standings, setStandings] = useState<Standing[]>(initialStandings)
  const [topScorers, setTopScorers] = useState<Scorer[]>(initialTopScorers)
  const [mostMatches, setMostMatches] = useState<PlayerMatches[]>(initialMostMatches)
  const [loading, setLoading] = useState(false)

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId)

  useEffect(() => {
    if (!selectedTournamentId || selectedTournamentId === initialTournamentId) return

    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()

      const { data: standingsData } = await supabase
        .from("TournamentStandings")
        .select("*")
        .eq("tournament_id", selectedTournamentId)
        .order("position", { ascending: true })

      if (standingsData) setStandings(standingsData)
      setLoading(false)
    }

    fetchData()
  }, [selectedTournamentId, initialTournamentId])

  const isOurTeam = (teamName: string) => {
    const name = teamName.toLowerCase()
    return name.includes("carlos casares") || name.includes("ccc") || name.includes("club carlos")
  }

  if (tournaments.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Selector de torneo */}
      {tournaments.length > 1 && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Torneo:</span>
          <Select
            value={selectedTournamentId?.toString() || ""}
            onValueChange={(v) => setSelectedTournamentId(parseInt(v))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Seleccionar torneo" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name} {t.year && `(${t.year})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tabla de posiciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Tabla de Posiciones
              {selectedTournament && (
                <Badge variant="outline" className="ml-2">
                  {selectedTournament.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : standings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Equipo</th>
                      <th className="text-center p-2">PJ</th>
                      <th className="text-center p-2">G</th>
                      <th className="text-center p-2">E</th>
                      <th className="text-center p-2">P</th>
                      <th className="text-center p-2">DG</th>
                      <th className="text-center p-2 font-bold">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team) => (
                      <tr
                        key={team.id}
                        className={`border-b hover:bg-muted/50 ${
                          isOurTeam(team.team_name)
                            ? "bg-primary/10 font-semibold"
                            : ""
                        }`}
                      >
                        <td className="p-2">{team.position}</td>
                        <td className="p-2">{team.team_name}</td>
                        <td className="text-center p-2">{team.played}</td>
                        <td className="text-center p-2">{team.won}</td>
                        <td className="text-center p-2">{team.drawn}</td>
                        <td className="text-center p-2">{team.lost}</td>
                        <td className="text-center p-2">
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </td>
                        <td className="text-center p-2 font-bold">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay datos de tabla disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* Goleadores y Mas partidos */}
        <div className="space-y-6">
          {/* Top Goleadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                Goleadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topScorers.length > 0 ? (
                <div className="space-y-3">
                  {topScorers.slice(0, 5).map((scorer, index) => (
                    <Link
                      key={scorer.id}
                      href={scorer.socio_number ? `/perfil/${scorer.socio_number}` : "#"}
                      className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {scorer.photo_url ? (
                          <Image
                            src={scorer.photo_url || "/placeholder.svg"}
                            alt={scorer.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                            {scorer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{scorer.name}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {scorer.goals}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  Sin datos
                </p>
              )}
            </CardContent>
          </Card>

          {/* Mas partidos jugados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Mas Partidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mostMatches.length > 0 ? (
                <div className="space-y-3">
                  {mostMatches.slice(0, 5).map((player, index) => (
                    <Link
                      key={player.id}
                      href={player.socio_number ? `/perfil/${player.socio_number}` : "#"}
                      className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {player.photo_url ? (
                          <Image
                            src={player.photo_url || "/placeholder.svg"}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                            {player.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{player.name}</p>
                      </div>
                      <Badge variant="outline">
                        {player.matches_played}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  Sin datos
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
