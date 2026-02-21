"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CalendarDays,
  MapPin, 
  Trophy,
  Clock,
  X,
  Filter,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Handshake,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  isAfter,
  isBefore
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SportIcon } from "@/lib/sport-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Match {
  id: number
  discipline_id: number
  match_date: string
  match_time: string
  rival_team: string
  match_type?: string
  status: string
  tournament: {
    name: string
    year: number
  } | null
  location: {
    name: string
    city: string
    google_maps_url?: string
  } | null
  discipline: {
    id: number
    name: string
    slug: string
  }
  result?: {
    our_score: number
    rival_score: number
  } | null
}

interface Discipline {
  id: number
  name: string
  slug: string
}

type ViewMode = 'month' | 'week'

interface User {
  id: string
  email: string
  id_rol?: number
}

interface CalendarProps {
  user?: User | null
  initialDate?: string
  canManage?: boolean
  managedDisciplineIds?: number[]
}

interface Tournament {
  id: number
  name: string
  year: number
}

interface Location {
  id: number
  name: string
  city: string
  google_maps_url?: string
}

export function CalendarComponent({ user, initialDate, canManage = false, managedDisciplineIds = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (initialDate) {
      return new Date(initialDate + 'T12:00:00')
    }
    return new Date()
  })
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMatches, setSelectedMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedShareDates, setSelectedShareDates] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [shareRange, setShareRange] = useState<{ start: Date; end: Date } | null>(null)
  
  // Flag para abrir modal de fecha inicial solo una vez
  const [initialDateHandled, setInitialDateHandled] = useState(false)

  // Estados para CRUD
  const [addMatchDialogOpen, setAddMatchDialogOpen] = useState(false)
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<Date | null>(null)
  const [editMatchDialogOpen, setEditMatchDialogOpen] = useState(false)
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [saving, setSaving] = useState(false)
  const [newMatch, setNewMatch] = useState({
    discipline_id: '',
    rival_team: '',
    match_date: '',
    match_time: '',
    tournament_id: '',
    location_id: '',
    match_type: 'Amistoso'
  })
  
  // Verificar si el usuario puede gestionar partidos
  const canManageMatches = canManage
  
  // Función para verificar si puede gestionar un partido específico (por disciplina)
  const canManageMatch = (match: Match) => {
    if (!canManage) return false
    if (managedDisciplineIds.length === 0) return true // Admin general
    return managedDisciplineIds.includes(match.discipline_id)
  }
  
  // Detectar mobile para cambiar vista por defecto
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setViewMode('week')
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Fetch disciplines para el filtro
  useEffect(() => {
    const fetchDisciplines = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("Disciplines")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name")
      
      if (data) setDisciplines(data)
    }
    fetchDisciplines()
  }, [])

  // Fetch tournaments y locations para el formulario de agregar
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [tournamentsRes, locationsRes] = await Promise.all([
        supabase.from("Tournaments").select("id, name, year").order("year", { ascending: false }),
        supabase.from("Locations").select("id, name, city, google_maps_url").order("name")
      ])
      if (tournamentsRes.data) setTournaments(tournamentsRes.data)
      if (locationsRes.data) setLocations(locationsRes.data)
    }
    if (canManageMatches) fetchData()
  }, [canManageMatches])

  // Fetch matches con cache - rango de 6 meses para evitar recargas constantes
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [fetchedRange, setFetchedRange] = useState<{ start: string; end: string } | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      // Calcular rango de 6 meses centrado en la fecha actual
      const rangeStart = subMonths(startOfMonth(currentDate), 3)
      const rangeEnd = addMonths(endOfMonth(currentDate), 3)
      const startStr = rangeStart.toISOString().split('T')[0]
      const endStr = rangeEnd.toISOString().split('T')[0]

      // Si ya tenemos datos para este rango, no recargar
      if (fetchedRange && fetchedRange.start <= startStr && fetchedRange.end >= endStr) {
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from("Matches")
        .select(`
          *,
          tournament:Tournaments(name, year),
          location:Locations(name, city, google_maps_url),
          discipline:Disciplines(id, name, slug),
          result:MatchResults(our_score, rival_score, scorers)
        `)
        .gte("match_date", startStr)
        .lte("match_date", endStr)
        .order("match_date", { ascending: true })

      if (data) {
        setAllMatches(data)
        setFetchedRange({ start: startStr, end: endStr })
      }
      setLoading(false)
    }

    fetchMatches()
  }, [currentDate, fetchedRange])

  // Filtrar matches para la vista actual (en cliente, sin fetch)
  const matches = useMemo(() => {
    let filtered = allMatches

    // Filtrar por disciplina
    if (selectedDiscipline !== "all") {
      filtered = filtered.filter(m => m.discipline_id === parseInt(selectedDiscipline))
    }

    // Filtrar por rango de fechas de la vista
    let startDate: Date
    let endDate: Date

    if (viewMode === 'month') {
      startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
      endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
    } else {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
    }

    return filtered.filter(m => {
      const matchDate = new Date(m.match_date + 'T12:00:00')
      return matchDate >= startDate && matchDate <= endDate
    })
  }, [allMatches, selectedDiscipline, currentDate, viewMode])

  // Abrir modal de la fecha cuando viene de un link con date (solo la primera vez)
  useEffect(() => {
    if (initialDate && !loading && allMatches.length > 0 && !initialDateHandled) {
      const targetDate = new Date(initialDate + 'T12:00:00')
      const matchesForDate = allMatches.filter(m => {
        const matchDate = new Date(m.match_date + 'T12:00:00')
        return matchDate.toDateString() === targetDate.toDateString()
      })
      if (matchesForDate.length > 0) {
        const timer = setTimeout(() => {
          setSelectedDate(targetDate)
          setSelectedMatches(matchesForDate)
          setInitialDateHandled(true)
        }, 100)
        return () => clearTimeout(timer)
      }
      setInitialDateHandled(true)
    }
  }, [initialDate, loading, allMatches, initialDateHandled])

  // Fetch upcoming matches para el carrusel
  useEffect(() => {
    const fetchUpcoming = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      
      let query = supabase
        .from("Matches")
        .select(`
          *,
          tournament:Tournaments(name, year),
          location:Locations(name, city, google_maps_url),
          discipline:Disciplines(id, name, slug),
          result:MatchResults(our_score, rival_score, scorers)
        `)
        .gte("match_date", today)
        .order("match_date", { ascending: true })
        .limit(10)

      if (selectedDiscipline !== "all") {
        query = query.eq("discipline_id", parseInt(selectedDiscipline))
      }

      const { data } = await query
      if (data) setUpcomingMatches(data)
    }
    fetchUpcoming()
  }, [selectedDiscipline])

  // Agrupar partidos por dia para el carrusel
  const matchesByDay = useMemo(() => {
    const grouped: Record<string, Match[]> = {}
    upcomingMatches.forEach(match => {
      const dateKey = match.match_date
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(match)
    })
    return Object.entries(grouped).map(([date, matches]) => ({
      date,
      matches
    }))
  }, [upcomingMatches])

  const prev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }
  
  const next = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    // Solo navegar al mes/semana actual, no abrir el modal
  }

  const getMatchesForDate = (date: Date): Match[] => {
    return matches.filter(match => 
      isSameDay(parseISO(match.match_date), date)
    )
  }

  const handleDateClick = (date: Date) => {
    const dayMatches = getMatchesForDate(date)
    if (dayMatches.length > 0) {
      setSelectedDate(date)
      setSelectedMatches(dayMatches)
    }
  }

  const getMatchTypeLabel = (type?: string) => {
    if (!type) return null
    const types: Record<string, string> = {
      'grupo': 'Fase de Grupos',
      'octavos': 'Octavos de Final',
      'cuartos': 'Cuartos de Final',
      'semifinal': 'Semifinal',
      'final': 'Final',
      'playoff': 'Playoff',
      'regular': 'Temporada Regular',
      'amistoso': 'Amistoso'
    }
    return types[type.toLowerCase()] || type
  }

  // Formatear tiempo sin segundos (HH:MM)
  const formatTime = (time: string) => {
    if (!time) return ''
    const parts = time.split(':')
    return `${parts[0]}:${parts[1]}`
  }

  const generateShareUrl = (matchId?: number, date?: string, startDate?: string, endDate?: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const params = new URLSearchParams()
    
    if (matchId) params.set('partido', matchId.toString())
    if (date) params.set('fecha', date)
    if (startDate && endDate) {
      params.set('desde', startDate)
      params.set('hasta', endDate)
    }
    
    return `${baseUrl}/calendario?${params.toString()}`
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openShareRangeDialog = () => {
    // Pre-seleccionar todas las próximas fechas
    const upcomingDates = matchesByDay.map(({ date }) => date)
    setSelectedShareDates(upcomingDates)
    setShareDialogOpen(true)
  }

  const handleAddMatch = (date: Date) => {
    setSelectedDateForAdd(date)
    setNewMatch({
      discipline_id: '',
      rival_team: '',
      match_date: format(date, 'yyyy-MM-dd'),
      match_time: '20:00',
      tournament_id: '',
      location_id: '',
      match_type: 'Amistoso'
    })
    setAddMatchDialogOpen(true)
  }

  const handleEditMatch = (match: Match) => {
    setMatchToEdit(match)
    setNewMatch({
      discipline_id: match.discipline_id.toString(),
      rival_team: match.rival_team,
      match_date: match.match_date,
      match_time: match.match_time.substring(0, 5),
      tournament_id: match.tournament?.name ? '' : '',
      location_id: '',
      match_type: match.match_type || 'Amistoso'
    })
    setEditMatchDialogOpen(true)
  }

  const handleDeleteMatch = (match: Match) => {
    setMatchToDelete(match)
    setDeleteDialogOpen(true)
  }

  const saveNewMatch = async () => {
    if (!newMatch.discipline_id || !newMatch.rival_team) return
    setSaving(true)
    
    const supabase = createClient()
    const { error } = await supabase.from("Matches").insert({
      discipline_id: parseInt(newMatch.discipline_id),
      rival_team: newMatch.rival_team,
      match_date: newMatch.match_date,
      match_time: newMatch.match_time,
      tournament_id: newMatch.tournament_id ? parseInt(newMatch.tournament_id) : null,
      location_id: newMatch.location_id ? parseInt(newMatch.location_id) : null,
      match_type: newMatch.match_type,
      status: 'scheduled'
    })

    if (!error) {
      setAddMatchDialogOpen(false)
      // Forzar recarga de datos sin reload de página
      setFetchedRange(null)
    }
    setSaving(false)
  }

  const updateMatch = async () => {
    if (!matchToEdit || !newMatch.rival_team) return
    setSaving(true)
    
    const supabase = createClient()
    const { error } = await supabase.from("Matches")
      .update({
        discipline_id: parseInt(newMatch.discipline_id),
        rival_team: newMatch.rival_team,
        match_date: newMatch.match_date,
        match_time: newMatch.match_time,
        tournament_id: newMatch.tournament_id ? parseInt(newMatch.tournament_id) : null,
        location_id: newMatch.location_id ? parseInt(newMatch.location_id) : null,
        match_type: newMatch.match_type
      })
      .eq('id', matchToEdit.id)

    if (!error) {
      setEditMatchDialogOpen(false)
      setMatchToEdit(null)
      setSelectedDate(null)
      // Forzar recarga de datos sin reload de página
      setFetchedRange(null)
    }
    setSaving(false)
  }

  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return
    setSaving(true)
    
    const supabase = createClient()
    
    // Primero eliminar resultados asociados
    await supabase.from("MatchResults").delete().eq('match_id', matchToDelete.id)
    
    // Luego eliminar el partido
    const { error } = await supabase.from("Matches").delete().eq('id', matchToDelete.id)

    if (!error) {
      setDeleteDialogOpen(false)
      setMatchToDelete(null)
      setSelectedDate(null)
      // Forzar recarga de datos sin reload de página
      setFetchedRange(null)
    }
    setSaving(false)
  }

  // Helper para obtener icono segun tipo de partido
  const getMatchIcon = (match: Match) => {
    const isAmistoso = match.match_type?.toLowerCase() === 'amistoso' || !match.tournament
    return isAmistoso 
      ? <Handshake className="w-4 h-4" /> 
      : <Trophy className="w-4 h-4" />
  }

// Carrusel de proximos partidos (horizontal, ordenado por fecha y hora)
  const renderUpcomingCarousel = () => {
    // Ordenar todos los partidos por fecha y hora
    const sortedMatches = [...upcomingMatches].sort((a, b) => {
      const dateCompare = a.match_date.localeCompare(b.match_date)
      if (dateCompare !== 0) return dateCompare
      return (a.match_time || '').localeCompare(b.match_time || '')
    })

    if (sortedMatches.length === 0) return null

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Proximos Partidos
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openShareRangeDialog}
            className="bg-transparent border-primary/30 hover:bg-primary/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Fechas
          </Button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {sortedMatches.map((match) => {
            const isAmistoso = match.match_type?.toLowerCase() === 'amistoso' || !match.tournament
            
            return (
              <div 
                key={match.id}
                className={cn(
                  "snap-start flex-shrink-0 w-[280px] bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
                  match.result 
                    ? match.result.our_score > match.result.rival_score 
                      ? "ring-2 ring-green-500"
                      : match.result.our_score < match.result.rival_score
                        ? "ring-2 ring-red-500"
                        : "ring-2 ring-secondary"
                    : ""
                )}
                onClick={() => {
                  const matchDate = new Date(match.match_date + 'T12:00:00')
                  const dayMatches = upcomingMatches.filter(m => m.match_date === match.match_date)
                  setSelectedDate(matchDate)
                  setSelectedMatches(dayMatches)
                }}
              >
                {/* Header con fecha */}
                <div className="bg-primary/10 px-4 py-2 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {format(parseISO(match.match_date), "EEEE", { locale: es })}
                      </div>
                      <div className="text-sm font-semibold">
                        {format(parseISO(match.match_date), "d 'de' MMMM", { locale: es })}
                      </div>
                    </div>
                    {!match.result && match.match_time && (
                      <div className="text-primary font-bold text-lg">
                        {formatTime(match.match_time)}
                        <span className="text-xs text-muted-foreground ml-0.5">hs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  {/* Disciplina + Tipo de partido */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <SportIcon sport={match.discipline.slug} className="w-4 h-4 text-primary" />
                      <span>{match.discipline.name}</span>
                    </div>
                    <span className="text-muted-foreground/50">|</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {isAmistoso ? (
                        <Handshake className="w-3.5 h-3.5" />
                      ) : (
                        <Trophy className="w-3.5 h-3.5" />
                      )}
                      <span>{isAmistoso ? 'Amistoso' : (match.tournament?.name || 'Torneo')}</span>
                    </div>
                  </div>

                  {/* Rival */}
                  <h4 className="text-lg font-bold text-foreground mb-2">{match.rival_team}</h4>
                  
                  {/* Resultado o Tipo de partido */}
                  {match.result ? (
                    <div className="text-2xl font-bold text-center mb-2">
                      <span className={match.result.our_score > match.result.rival_score ? "text-green-500" : "text-foreground"}>
                        {match.result.our_score}
                      </span>
                      <span className="mx-2 text-muted-foreground">-</span>
                      <span className={match.result.rival_score > match.result.our_score ? "text-red-500" : "text-foreground"}>
                        {match.result.rival_score}
                      </span>
                    </div>
                  ) : match.match_type && match.match_type !== 'amistoso' ? (
                    <span className="inline-block bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-semibold uppercase">
                      {getMatchTypeLabel(match.match_type)}
                    </span>
                  ) : null}
                </div>

                {/* Footer con ubicacion */}
                {match.location && (
                  <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
                    {match.location.google_maps_url ? (
                      <a 
                        href={match.location.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-3 h-3" />
                        {match.location.name}
                      </a>
                    ) : (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.location.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-4 mb-6">
        {/* Controles principales */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="outline" size="icon" onClick={prev} className="bg-transparent border-primary/30 hover:bg-primary/10">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg md:text-2xl font-bold capitalize min-w-[160px] md:min-w-[200px] text-center">
              {viewMode === 'month' 
                ? format(currentDate, "MMMM yyyy", { locale: es })
                : `Semana del ${format(startOfWeek(currentDate), "d MMM", { locale: es })}`
              }
            </h2>
            <Button variant="outline" size="icon" onClick={next} className="bg-transparent border-primary/30 hover:bg-primary/10">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
            {/* Toggle vista */}
            <div className="flex rounded-lg border border-primary/30 overflow-hidden">
              <Button 
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className={cn(
                  "rounded-none",
                  viewMode !== 'month' && "bg-transparent hover:bg-primary/10"
                )}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Mes</span>
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={cn(
                  "rounded-none",
                  viewMode !== 'week' && "bg-transparent hover:bg-primary/10"
                )}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Semana</span>
              </Button>
            </div>

            <Button variant="default" onClick={goToToday} size="sm">
              Hoy
            </Button>
          </div>
        </div>

        {/* Filtro por disciplina */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
            <SelectTrigger className="w-full md:w-[220px] bg-card">
              <SelectValue placeholder="Filtrar por disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las disciplinas</SelectItem>
              {disciplines.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  const renderDaysHeader = () => {
    const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
    return (
      <div className="grid grid-cols-7 mb-2 bg-primary/10 rounded-t-lg">
        {days.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-3 text-primary">
            {day}
          </div>
        ))}
      </div>
    )
  }

  // Vista mensual - Celdas del calendario
  const renderMonthCells = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const today = new Date()

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day
        const dayMatches = getMatchesForDate(currentDay)
        const isCurrentMonth = isSameMonth(currentDay, monthStart)
        const isToday = isSameDay(currentDay, today)
        const hasMatches = dayMatches.length > 0

        const cellContent = (
          <div
            key={currentDay.toString()}
            onClick={() => handleDateClick(currentDay)}
            className={cn(
              "min-h-[80px] md:min-h-[100px] border border-border/30 p-1 md:p-2 transition-all",
              !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
              isCurrentMonth && "bg-card hover:bg-accent/30",
              hasMatches && "cursor-pointer",
              isToday && "ring-2 ring-primary ring-inset bg-primary/5"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-sm font-medium mb-1",
              isToday && "bg-primary text-primary-foreground"
            )}>
              {format(currentDay, "d")}
            </div>
            
            {hasMatches && (
              <div className="space-y-1">
                {dayMatches.slice(0, 2).map((match) => {
                  const statusColor = match.result 
                    ? match.result.our_score > match.result.rival_score 
                      ? "text-green-600 dark:text-green-400"
                      : match.result.our_score < match.result.rival_score
                        ? "text-red-600 dark:text-red-400"
                        : "text-secondary"
                    : "text-muted-foreground"
                  const bgColor = match.result 
                    ? match.result.our_score > match.result.rival_score 
                      ? "bg-green-500/20"
                      : match.result.our_score < match.result.rival_score
                        ? "bg-red-500/20"
                        : "bg-secondary/30"
                    : "bg-muted/50"
                  const isAmistoso = match.match_type?.toLowerCase() === 'amistoso' || !match.tournament
                  return (
                    <div 
                      key={match.id}
                      className={cn(
                        "text-xs px-1 py-0.5 rounded font-medium flex items-center gap-1",
                        bgColor
                      )}
                    >
                      {isAmistoso ? (
                        <Handshake className={cn("w-3 h-3 flex-shrink-0", statusColor)} />
                      ) : (
                        <Trophy className={cn("w-3 h-3 flex-shrink-0", statusColor)} />
                      )}
                      <span className="truncate">{match.rival_team}</span>
                    </div>
                  )
                })}
                {dayMatches.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center font-medium">
                    +{dayMatches.length - 2} mas
                  </div>
                )}
              </div>
            )}
          </div>
        )
        
        // Envolver en context menu si tiene permisos
        if (canManageMatches) {
          days.push(
            <ContextMenu key={currentDay.toString()}>
              <ContextMenuTrigger asChild>
                {cellContent}
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleAddMatch(currentDay)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar partido
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )
        } else {
          days.push(cellContent)
        }
        
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      )
      days = []
    }
    return <div className="border border-border/50 rounded-b-lg overflow-hidden shadow-sm">{rows}</div>
  }

  // Vista semanal - Desktop (horizontal)
  const renderWeekDesktop = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const today = new Date()
    const days = []

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      const dayMatches = getMatchesForDate(day)
      const isToday = isSameDay(day, today)

      days.push(
        <div 
          key={day.toString()} 
          className={cn(
            "flex-1 border-r last:border-r-0 border-border/30 min-h-[300px]",
            isToday && "bg-primary/5"
          )}
        >
          <div className={cn(
            "text-center py-3 border-b border-border/30 sticky top-0 bg-card z-10",
            isToday && "bg-primary text-primary-foreground"
          )}>
            <div className="text-sm font-medium capitalize">
              {format(day, "EEE", { locale: es })}
            </div>
            <div className="text-2xl font-bold">{format(day, "d")}</div>
          </div>

          <div className="p-2 space-y-2">
            {dayMatches.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin partidos</p>
            ) : (
              dayMatches.map((match) => (
                <div key={match.id} className="group relative">
                  <Link 
                    href={`/disciplinas/${match.discipline.slug}`}
                    className="block"
                  >
                    <div className={cn(
                      "rounded-lg p-2 text-xs hover:shadow-md transition-all",
                      match.result 
                        ? match.result.our_score > match.result.rival_score 
                          ? "bg-green-500/10 border-l-2 border-green-500"
                          : match.result.our_score < match.result.rival_score
                            ? "bg-red-500/10 border-l-2 border-red-500"
                            : "bg-secondary/10 border-l-2 border-secondary"
                        : "bg-muted/30 border-l-2 border-muted-foreground"
                    )}>
                      <div className="font-semibold text-foreground truncate">{match.discipline.name}</div>
                      <div className="font-medium mt-1">vs {match.rival_team}</div>
                      {match.result ? (
                        <div className="text-lg font-bold mt-1">
                          {match.result.our_score} - {match.result.rival_score}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTime(match.match_time)}hs
                        </div>
                      )}
                      {match.tournament && (
                        <div className="text-muted-foreground truncate mt-1">
                          {match.tournament.name}
                        </div>
                      )}
                      {match.match_type && (
                        <span className="inline-block mt-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-medium">
                          {getMatchTypeLabel(match.match_type)}
                        </span>
                      )}
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      copyToClipboard(generateShareUrl(match.id))
                    }}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="hidden md:flex border border-border/50 rounded-lg overflow-hidden shadow-sm bg-card">
        {days}
      </div>
    )
  }

  // Vista semanal - Mobile (vertical con mas informacion)
  const renderWeekMobile = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const today = new Date()
    const days = []

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      const dayMatches = getMatchesForDate(day)
      const isToday = isSameDay(day, today)

      // Solo mostrar dias con partidos en mobile
      if (dayMatches.length === 0 && !isToday) continue

      days.push(
        <div 
          key={day.toString()} 
          className={cn(
            "rounded-lg overflow-hidden border border-border/30",
            isToday && "ring-2 ring-primary"
          )}
        >
          {/* Header del dia */}
          <div className={cn(
            "flex items-center gap-3 p-3 border-b border-border/20",
            isToday ? "bg-primary text-primary-foreground" : "bg-primary/10"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-full flex flex-col items-center justify-center",
              isToday ? "bg-primary-foreground/20" : "bg-background"
            )}>
              <span className={cn(
                "text-xs capitalize",
                isToday ? "text-primary-foreground" : "text-primary"
              )}>
                {format(day, "EEE", { locale: es })}
              </span>
              <span className={cn(
                "text-lg font-bold",
                isToday ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(day, "d")}
              </span>
            </div>
            <div className="flex-1">
              <div className={cn(
                "text-sm capitalize font-medium",
                isToday ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(day, "EEEE", { locale: es })}
              </div>
              <div className={cn(
                "text-xs",
                isToday ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {format(day, "d 'de' MMMM yyyy", { locale: es })}
              </div>
            </div>
            <Button
              variant={isToday ? "secondary" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(generateShareUrl(undefined, day.toISOString().split('T')[0]))}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Partidos del dia */}
          <div className="p-3 space-y-3 bg-card">
            {dayMatches.length === 0 && isToday && (
              <p className="text-center text-muted-foreground py-4">Sin partidos hoy</p>
            )}
            {dayMatches.map((match) => (
              <div 
                key={match.id} 
                className="relative rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => window.location.href = `/disciplinas/${match.discipline.slug}`}
              >
                {/* Tarjeta estilo diseno */}
                <div className={cn(
                  "bg-card border border-border",
                  match.result 
                    ? match.result.our_score > match.result.rival_score 
                      ? "ring-2 ring-green-500"
                      : match.result.our_score < match.result.rival_score
                        ? "ring-2 ring-red-500"
                        : "ring-2 ring-secondary"
                    : ""
                )}>
                  {/* Badge disciplina */}
                  <div className="flex justify-center pt-4">
                    <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                      {match.discipline.name}
                    </span>
                  </div>

                  {/* Contenido central */}
                  <div className="px-6 py-6 text-center">
                    {/* Rival */}
                    <h3 className="text-2xl font-bold tracking-wide mb-4 text-foreground">
                      {match.rival_team}
                    </h3>

                    {/* Resultado o Instancia */}
                    {match.result ? (
                      <div className="text-3xl font-bold mb-4">
                        <span className={cn(
                          match.result.our_score > match.result.rival_score 
                            ? "text-green-500" 
                            : "text-foreground"
                        )}>
                          {match.result.our_score}
                        </span>
                        <span className="mx-2 text-muted-foreground">-</span>
                        <span className={cn(
                          match.result.rival_score > match.result.our_score 
                            ? "text-red-500" 
                            : "text-foreground"
                        )}>
                          {match.result.rival_score}
                        </span>
                      </div>
                    ) : (
                      <>
                        {match.match_type && (
                          <span className="inline-block bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            {getMatchTypeLabel(match.match_type)}
                          </span>
                        )}
                      </>
                    )}

                    {/* Horario con lineas */}
                    {!match.result && (
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px bg-border w-12"></div>
                        <span className="text-lg font-semibold text-primary">
                          {formatTime(match.match_time)} <span className="text-muted-foreground text-sm">hs</span>
                        </span>
                        <div className="h-px bg-border w-12"></div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                    {match.tournament ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        <span>{match.tournament.name}</span>
                      </div>
                    ) : <div />}
                    
                    {match.location ? (
                      match.location.google_maps_url ? (
                        <a 
                          href={match.location.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin className="w-4 h-4" />
                          <span>{match.location.name}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{match.location.name}</span>
                        </div>
                      )
                    ) : <div />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (days.length === 0) {
      return (
        <div className="md:hidden text-center py-8 text-muted-foreground">
          No hay partidos esta semana
        </div>
      )
    }

    return (
      <div className="md:hidden space-y-4">
        {days}
      </div>
    )
  }

  // Leyenda
  const renderLegend = () => (
    <div className="flex flex-wrap gap-4 justify-center mt-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-green-500/30 border-l-2 border-green-500" />
        <span className="text-muted-foreground">Victoria</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-red-500/30 border-l-2 border-red-500" />
        <span className="text-muted-foreground">Derrota</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-secondary/30 border-l-2 border-secondary" />
        <span className="text-muted-foreground">Empate</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-muted/50 border-l-2 border-muted-foreground" />
        <span className="text-muted-foreground">Pendiente</span>
      </div>
      <div className="border-l border-border/50 h-4" />
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground">Torneo</span>
      </div>
      <div className="flex items-center gap-2">
        <Handshake className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Amistoso</span>
      </div>
    </div>
  )

  // Modal detalles del dia
  const renderModal = () => (
    <Dialog open={selectedDate !== null} onOpenChange={() => setSelectedDate(null)}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-foreground font-semibold capitalize">
            {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedDate && copyToClipboard(generateShareUrl(undefined, selectedDate.toISOString().split('T')[0]))}
              className="bg-transparent border-primary/50 text-primary hover:bg-primary/10 h-8 px-3"
            >
              <Share2 className="w-3 h-3 mr-1.5" />
              <span className="text-xs">Compartir</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(null)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {selectedMatches.map((match) => {
            const isAmistoso = match.match_type?.toLowerCase() === 'amistoso' || !match.tournament
            const result = Array.isArray(match.result) ? match.result[0] : match.result
            return (
              <div 
                key={match.id}
                className="bg-muted/50 rounded-lg overflow-hidden border border-border"
              >
                {/* Cabecera del partido */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isAmistoso ? (
                        <Handshake className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Trophy className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-foreground font-medium">{match.discipline.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {canManageMatch(match) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditMatch(match)
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMatch(match)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-muted-foreground text-sm">vs </span>
                      <span className="text-foreground font-bold text-lg">{match.rival_team}</span>
                    </div>
                    {!result && (
                      <div className="flex items-center gap-1.5 text-primary">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{formatTime(match.match_time)}hs</span>
                      </div>
                    )}
                  </div>
                  
                  {result && (
                    <>
                      <div className="text-3xl font-bold text-center mb-3">
                        <span className={result.our_score > result.rival_score ? "text-green-500" : "text-foreground"}>
                          {result.our_score}
                        </span>
                        <span className="mx-2 text-muted-foreground">-</span>
                        <span className={result.rival_score > result.our_score ? "text-red-500" : "text-foreground"}>
                          {result.rival_score}
                        </span>
                      </div>
                      
                      {/* Goleadores */}
                      {result.scorers && result.scorers.length > 0 && (
                        <div className="mb-3 p-2 bg-background/50 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Goleadores:</p>
                          <div className="space-y-0.5">
                            {result.scorers.map((scorer: string, idx: number) => (
                              <p key={idx} className="text-sm text-foreground">
                                {scorer}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs">
                    {match.tournament && (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{match.tournament.name}</span>
                    )}
                    {match.match_type && (
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded uppercase font-semibold">
                        {getMatchTypeLabel(match.match_type)}
                      </span>
                    )}
                    {match.location && (
                      match.location.google_maps_url ? (
                        <a 
                          href={match.location.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          {match.location.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {match.location.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )

  // Dialog para compartir proximas fechas
  const renderShareRangeDialog = () => {
    const toggleDate = (date: string) => {
      setSelectedShareDates(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date)
          : [...prev, date].sort()
      )
    }

    const selectAll = () => {
      setSelectedShareDates(matchesByDay.map(({ date }) => date))
    }

    const selectNone = () => {
      setSelectedShareDates([])
    }

    return (
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir Proximas Fechas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona las fechas que deseas compartir:
            </p>
            
            {/* Botones seleccionar todo/ninguno */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="bg-transparent text-xs">
                Seleccionar todas
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone} className="bg-transparent text-xs">
                Ninguna
              </Button>
            </div>

            {/* Lista de fechas con checkboxes */}
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {matchesByDay.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay proximas fechas disponibles
                </p>
              ) : (
                matchesByDay.map(({ date, matches }) => (
                  <label
                    key={date}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedShareDates.includes(date)
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedShareDates.includes(date)}
                      onChange={() => toggleDate(date)}
                      className="w-4 h-4 accent-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShareDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={selectedShareDates.length === 0}
                onClick={() => {
                  if (selectedShareDates.length > 0) {
                    const sortedDates = [...selectedShareDates].sort()
                    const url = generateShareUrl(
                      undefined,
                      undefined,
                      sortedDates[0],
                      sortedDates[sortedDates.length - 1]
                    )
                    copyToClipboard(url)
                    setShareDialogOpen(false)
                  }
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Enlace
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Carrusel de proximos partidos */}
      {renderUpcomingCarousel()}
      
      {/* Calendario */}
      <div className="bg-card/50 rounded-xl p-4 md:p-6 border border-border/50">
        {renderHeader()}
        
        {viewMode === 'month' ? (
          <>
            {renderDaysHeader()}
            {renderMonthCells()}
          </>
        ) : (
          <>
            {renderWeekDesktop()}
            {renderWeekMobile()}
          </>
        )}
        
        {renderLegend()}
      </div>

      {renderModal()}
      {renderShareRangeDialog()}
      
      {/* Dialog agregar partido */}
      <Dialog open={addMatchDialogOpen} onOpenChange={setAddMatchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Agregar Partido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Disciplina *</Label>
              <Select value={newMatch.discipline_id} onValueChange={(v) => setNewMatch(p => ({ ...p, discipline_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar disciplina" /></SelectTrigger>
                <SelectContent>
                  {disciplines.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rival *</Label>
              <Input 
                value={newMatch.rival_team}
                onChange={(e) => setNewMatch(p => ({ ...p, rival_team: e.target.value }))}
                placeholder="Nombre del equipo rival"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input 
                  type="date"
                  value={newMatch.match_date}
                  onChange={(e) => setNewMatch(p => ({ ...p, match_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Horario</Label>
                <Input 
                  type="time"
                  value={newMatch.match_time}
                  onChange={(e) => setNewMatch(p => ({ ...p, match_time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Instancia</Label>
              <Select value={newMatch.match_type} onValueChange={(v) => setNewMatch(p => ({ ...p, match_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div>
              <Label>Torneo (opcional)</Label>
              <Select value={newMatch.tournament_id || "none"} onValueChange={(v) => setNewMatch(p => ({ ...p, tournament_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Sin torneo (amistoso)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin torneo</SelectItem>
                  {tournaments.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name} ({t.year})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ubicacion (opcional)</Label>
              <Select value={newMatch.location_id || "none"} onValueChange={(v) => setNewMatch(p => ({ ...p, location_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar ubicacion" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin ubicacion</SelectItem>
                  {locations.map(l => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.name} - {l.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setAddMatchDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={saveNewMatch} disabled={saving || !newMatch.discipline_id || !newMatch.rival_team}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog editar partido */}
      <Dialog open={editMatchDialogOpen} onOpenChange={setEditMatchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar Partido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Disciplina *</Label>
              <Select value={newMatch.discipline_id} onValueChange={(v) => setNewMatch(p => ({ ...p, discipline_id: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {disciplines.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rival *</Label>
              <Input 
                value={newMatch.rival_team}
                onChange={(e) => setNewMatch(p => ({ ...p, rival_team: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input 
                  type="date"
                  value={newMatch.match_date}
                  onChange={(e) => setNewMatch(p => ({ ...p, match_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Horario</Label>
                <Input 
                  type="time"
                  value={newMatch.match_time}
                  onChange={(e) => setNewMatch(p => ({ ...p, match_time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Instancia</Label>
              <Select value={newMatch.match_type} onValueChange={(v) => setNewMatch(p => ({ ...p, match_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setEditMatchDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={updateMatch} disabled={saving || !newMatch.rival_team}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminacion */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Partido
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Estas por eliminar el partido:</p>
              <p className="font-semibold text-foreground">
                {matchToDelete?.discipline.name} vs {matchToDelete?.rival_team}
              </p>
              <p className="text-red-500 font-medium">
                Esta accion es irreversible. No podras recuperar este partido.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteMatch}
              disabled={saving}
            >
              {saving ? "Eliminando..." : "Eliminar Partido"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
