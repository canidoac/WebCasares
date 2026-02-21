"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react'
import { 
  getMatches, 
  createMatch, 
  deleteMatch,
  getTournaments,
  getLocations,
  createTournament,
  createLocation
} from "@/app/admin/disciplinas/actions"

interface Match {
  id: number
  discipline_id: number
  tournament_id: number
  location_id: number
  match_date: string
  match_time: string
  rival_team: string
  match_type: string | null
  tournament: { name: string; year: number }
  location: { name: string; address: string | null; city: string | null }
}

interface Tournament {
  id: number
  name: string
  year: number
}

interface Location {
  id: number
  name: string
  address: string | null
  city: string | null
}

interface DisciplineMatchesTabProps {
  disciplineId: number
}

export function DisciplineMatchesTab({ disciplineId }: DisciplineMatchesTabProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMatch, setShowNewMatch] = useState(false)
  const [showNewTournament, setShowNewTournament] = useState(false)
  const [showNewLocation, setShowNewLocation] = useState(false)

  const [newMatch, setNewMatch] = useState({
    tournament_id: '',
    location_id: '',
    match_date: '',
    match_time: '',
    rival_team: '',
    match_type: '',
  })

  const [newTournament, setNewTournament] = useState({
    name: '',
    year: new Date().getFullYear(),
  })

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
  })

  useEffect(() => {
    loadData()
  }, [disciplineId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [matchesData, tournamentsData, locationsData] = await Promise.all([
        getMatches(disciplineId, true),
        getTournaments(disciplineId),
        getLocations(disciplineId),
      ])
      setMatches(matchesData)
      setTournaments(tournamentsData)
      setLocations(locationsData)
    } catch (error) {
      console.error('[v0] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async () => {
    if (!newMatch.tournament_id || !newMatch.location_id || !newMatch.match_date || !newMatch.match_time || !newMatch.rival_team) {
      alert('Completa todos los campos requeridos')
      return
    }

    try {
      await createMatch({
        discipline_id: disciplineId,
        tournament_id: parseInt(newMatch.tournament_id),
        location_id: parseInt(newMatch.location_id),
        match_date: newMatch.match_date,
        match_time: newMatch.match_time,
        rival_team: newMatch.rival_team,
        match_type: newMatch.match_type || null,
      })
      setNewMatch({
        tournament_id: '',
        location_id: '',
        match_date: '',
        match_time: '',
        rival_team: '',
        match_type: '',
      })
      setShowNewMatch(false)
      await loadData()
    } catch (error) {
      console.error('[v0] Error creating match:', error)
      alert('Error al crear partido')
    }
  }

  const handleCreateTournament = async () => {
    if (!newTournament.name) {
      alert('El nombre es requerido')
      return
    }

    try {
      await createTournament({
        discipline_id: disciplineId,
        name: newTournament.name,
        year: newTournament.year,
      })
      setNewTournament({ name: '', year: new Date().getFullYear() })
      setShowNewTournament(false)
      await loadData()
    } catch (error) {
      console.error('[v0] Error creating tournament:', error)
      alert('Error al crear torneo')
    }
  }

  const handleCreateLocation = async () => {
    if (!newLocation.name) {
      alert('El nombre es requerido')
      return
    }

    try {
      await createLocation({
        discipline_id: disciplineId,
        name: newLocation.name,
        address: newLocation.address || null,
        city: newLocation.city || null,
      })
      setNewLocation({ name: '', address: '', city: '' })
      setShowNewLocation(false)
      await loadData()
    } catch (error) {
      console.error('[v0] Error creating location:', error)
      alert('Error al crear ubicación')
    }
  }

  const handleDeleteMatch = async (id: number) => {
    if (!confirm('¿Eliminar este partido?')) return

    try {
      await deleteMatch(id)
      await loadData()
    } catch (error) {
      console.error('[v0] Error deleting match:', error)
      alert('Error al eliminar partido')
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Cargando...</CardContent></Card>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Próximas Fechas</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewTournament(!showNewTournament)}>
            Gestionar Torneos
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowNewLocation(!showNewLocation)}>
            Gestionar Ubicaciones
          </Button>
        </div>
      </div>

      {/* Nuevo Torneo */}
      {showNewTournament && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={newTournament.name}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Liga Regional Amateur"
                />
              </div>
              <div className="space-y-2">
                <Label>Año</Label>
                <Input
                  type="number"
                  value={newTournament.year}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTournament}>Crear</Button>
              <Button variant="outline" onClick={() => setShowNewTournament(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nueva Ubicación */}
      {showNewLocation && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Estadio Municipal"
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={newLocation.address}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle 123"
                />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={newLocation.city}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Carlos Casares"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateLocation}>Crear</Button>
              <Button variant="outline" onClick={() => setShowNewLocation(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nuevo Partido */}
      <Card>
        <CardContent className="p-6">
          {!showNewMatch ? (
            <Button onClick={() => setShowNewMatch(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Fecha
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Nuevo Partido</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Torneo *</Label>
                  <Select value={newMatch.tournament_id} onValueChange={(value) => setNewMatch(prev => ({ ...prev, tournament_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona torneo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournaments.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} ({t.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ubicación *</Label>
                  <Select value={newMatch.location_id} onValueChange={(value) => setNewMatch(prev => ({ ...prev, location_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={newMatch.match_date}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, match_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={newMatch.match_time}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, match_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rival *</Label>
                  <Input
                    value={newMatch.rival_team}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, rival_team: e.target.value }))}
                    placeholder="Club Rival"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instancia</Label>
                  <Select value={newMatch.match_type} onValueChange={(value) => setNewMatch(prev => ({ ...prev, match_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fase del torneo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amistoso">Amistoso</SelectItem>
                      <SelectItem value="Fase de grupos">Fase de grupos</SelectItem>
                      <SelectItem value="Octavos">Octavos de final</SelectItem>
                      <SelectItem value="Cuartos">Cuartos de final</SelectItem>
                      <SelectItem value="Semifinal">Semifinal</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMatch}>Crear</Button>
                <Button variant="outline" onClick={() => setShowNewMatch(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Partidos */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay fechas próximas cargadas
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {new Date(match.match_date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} - {match.match_time}hs
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      Club Carlos Casares vs {match.rival_team}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>{match.location.name}</span>
                      {match.location.city && <span>- {match.location.city}</span>}
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {match.tournament.name} {match.tournament.year}
                      </span>
                      {match.match_type && (
                        <span className="px-2 py-1 bg-secondary rounded">
                          {match.match_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
