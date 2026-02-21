"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Trophy, Plus, X } from 'lucide-react'
import { getMatches, updateMatchResult } from "@/app/admin/disciplinas/actions"

interface Match {
  id: number
  discipline_id: number
  match_date: string
  match_time: string
  rival_team: string
  match_type: string | null
  status: string
  result?: {
    our_score: number
    rival_score: number
    scorers: any
  }
  tournament: { name: string; year: number } | null
  location: { name: string; address: string | null; city: string | null } | null
}

interface DisciplineResultsTabProps {
  disciplineId: number
}

export function DisciplineResultsTab({ disciplineId }: DisciplineResultsTabProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMatch, setEditingMatch] = useState<number | null>(null)
  const [resultForm, setResultForm] = useState({
    our_score: 0,
    rival_score: 0,
    scorers: [''] as string[],
  })

  useEffect(() => {
    loadMatches()
  }, [disciplineId])

  const loadMatches = async () => {
    setLoading(true)
    try {
      const data = await getMatches(disciplineId, false)
      // Normalizar datos: Supabase puede devolver relaciones como arrays
      const normalized = (data || []).map((m: any) => ({
        ...m,
        tournament: Array.isArray(m.tournament) ? m.tournament[0] || null : m.tournament,
        location: Array.isArray(m.location) ? m.location[0] || null : m.location,
        result: Array.isArray(m.result) ? m.result[0] || undefined : m.result,
      }))
      setMatches(normalized)
    } catch (error) {
      console.error('[v0] Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditResult = (match: Match) => {
    setEditingMatch(match.id)
    // result puede venir como array de Supabase, tomamos el primer elemento
    const result = Array.isArray(match.result) ? match.result[0] : match.result
    setResultForm({
      our_score: result?.our_score || 0,
      rival_score: result?.rival_score || 0,
      scorers: result?.scorers && result.scorers.length > 0 ? result.scorers : [''],
    })
  }

  const handleSaveResult = async (matchId: number) => {
    try {
      await updateMatchResult(matchId, {
        our_score: resultForm.our_score,
        rival_score: resultForm.rival_score,
        scorers: resultForm.scorers.filter(s => s.trim() !== ''),
      })
      setEditingMatch(null)
      await loadMatches()
    } catch (error) {
      console.error('[v0] Error saving result:', error)
      alert('Error al guardar resultado')
    }
  }

  const addScorer = () => {
    setResultForm(prev => ({
      ...prev,
      scorers: [...prev.scorers, '']
    }))
  }

  const removeScorer = (index: number) => {
    setResultForm(prev => ({
      ...prev,
      scorers: prev.scorers.filter((_, i) => i !== index)
    }))
  }

  // Helper para acceder al result (ya normalizado en loadMatches)
  const getResult = (match: Match) => match.result

  const updateScorer = (index: number, value: string) => {
    setResultForm(prev => ({
      ...prev,
      scorers: prev.scorers.map((s, i) => i === index ? value : s)
    }))
  }

  if (loading) {
    return <Card><CardContent className="p-6">Cargando...</CardContent></Card>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resultados</h2>
      </div>

      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay partidos jugados todavía
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-6">
                {editingMatch === match.id ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Cargar Resultado</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Goles Club Carlos Casares</Label>
                        <Input
                          type="number"
                          min="0"
                          value={resultForm.our_score}
                          onChange={(e) => setResultForm(prev => ({ ...prev, our_score: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Goles {match.rival_team}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={resultForm.rival_score}
                          onChange={(e) => setResultForm(prev => ({ ...prev, rival_score: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Goleadores del Club</Label>
                        <Button size="sm" variant="outline" onClick={addScorer}>
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                      {resultForm.scorers.map((scorer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={scorer}
                            onChange={(e) => updateScorer(index, e.target.value)}
                            placeholder="Nombre del goleador"
                          />
                          {resultForm.scorers.length > 1 && (
                            <Button size="icon" variant="ghost" onClick={() => removeScorer(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveResult(match.id)}>Guardar</Button>
                      <Button variant="outline" onClick={() => setEditingMatch(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(match.match_date).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>{match.tournament?.name} {match.tournament?.year}</span>
                      {match.match_type && (
                        <>
                          <span>•</span>
                          <span>{match.match_type}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold">
                        Club Carlos Casares {getResult(match)?.our_score ?? '-'} - {getResult(match)?.rival_score ?? '-'} {match.rival_team}
                      </h3>
                      {match.status !== 'completed' && (
                        <Button onClick={() => handleEditResult(match)}>
                          Cargar Resultado
                        </Button>
                      )}
                      {match.status === 'completed' && (
                        <Button variant="outline" onClick={() => handleEditResult(match)}>
                          Editar Resultado
                        </Button>
                      )}
                    </div>

                    {match.status === 'completed' && getResult(match)?.scorers && getResult(match)?.scorers?.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <span className="font-semibold">Goleadores: </span>
                          <span>{getResult(match)?.scorers?.join(', ')}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      <span>{match.location?.name || 'Sin ubicacion'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
