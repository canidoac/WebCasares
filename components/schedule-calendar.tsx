"use client"

import { useState, useMemo } from "react"
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, MapPin, Clock, Trophy, Handshake, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Match {
  id: number
  match_date: string
  match_time?: string
  rival_team: string
  is_home: boolean
  status: string
  match_type?: string
  location?: {
    name: string
    google_maps_url?: string
  } | null
  tournament?: {
    name: string
  } | null
  our_score?: number
  rival_score?: number
  citations?: number[]
  citation_time?: string
}

interface Player {
  id: number
  user: {
    NOMBRE: string
    APELLIDO: string
    display_name?: string
    photo_url?: string
  }
}

interface ScheduleCalendarProps {
  matches: Match[]
  canManageCitations?: boolean
  players?: Player[]
}

export function ScheduleCalendar({ matches, canManageCitations = false, players = [] }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMatches, setSelectedMatches] = useState<Match[]>([])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = useMemo(() => {
    const daysArray = []
    let day = calendarStart
    while (day <= calendarEnd) {
      daysArray.push(day)
      day = addDays(day, 1)
    }
    return daysArray
  }, [calendarStart, calendarEnd])

  const getMatchesForDate = (date: Date) => {
    return matches.filter(match => isSameDay(parseISO(match.match_date), date))
  }

  const handleDateClick = (date: Date) => {
    const dayMatches = getMatchesForDate(date)
    if (dayMatches.length > 0) {
      setSelectedDate(date)
      setSelectedMatches(dayMatches)
    }
  }

  const formatTime = (time?: string) => {
    if (!time) return ""
    return time.slice(0, 5)
  }

  const getResultBadge = (match: Match) => {
    if (match.our_score === undefined || match.rival_score === undefined) return null
    
    if (match.our_score > match.rival_score) {
      return <Badge variant="default" className="bg-green-500">Victoria</Badge>
    } else if (match.our_score < match.rival_score) {
      return <Badge variant="destructive">Derrota</Badge>
    }
    return <Badge variant="secondary">Empate</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header con navegacion */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h3>
        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Dias de la semana */}
        {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {/* Dias del mes */}
        {days.map((day, i) => {
          const dayMatches = getMatchesForDate(day)
          const hasMatches = dayMatches.length > 0
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={i}
              onClick={() => handleDateClick(day)}
              className={cn(
                "min-h-[80px] p-2 border rounded-lg transition-colors",
                !isCurrentMonth && "opacity-40",
                isToday && "border-primary",
                hasMatches && "cursor-pointer hover:bg-muted",
                hasMatches && "bg-primary/5"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isToday && "text-primary"
              )}>
                {format(day, "d")}
              </div>
              {dayMatches.slice(0, 2).map(match => (
                <div
                  key={match.id}
                  className={cn(
                    "text-xs p-1 rounded mb-1 truncate",
                    match.status === "completed" 
                      ? match.our_score !== undefined && match.rival_score !== undefined
                        ? match.our_score > match.rival_score
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : match.our_score < match.rival_score
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-muted"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  vs {match.rival_team}
                </div>
              ))}
              {dayMatches.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayMatches.length - 2} mas
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lista de partidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Todos los Partidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay partidos registrados
              </p>
            ) : (
              matches
                .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
                .map(match => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {format(parseISO(match.match_date), "dd", { locale: es })}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {format(parseISO(match.match_date), "MMM", { locale: es })}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">vs {match.rival_team}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {match.match_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(match.match_time)}
                            </span>
                          )}
                          {match.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.location.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.status === "completed" && match.our_score !== undefined && match.rival_score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {match.our_score} - {match.rival_score}
                          </span>
                          {getResultBadge(match)}
                        </div>
                      ) : (
                        <Badge variant="outline">
                          {match.is_home ? "Local" : "Visitante"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para ver detalles del dia */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMatches.map(match => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {match.tournament ? (
                      <Trophy className="h-4 w-4 text-primary" />
                    ) : (
                      <Handshake className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {match.tournament?.name || "Amistoso"}
                    </span>
                  </div>
                  
                  <div className="text-xl font-bold text-center py-4">
                    {match.status === "completed" && match.our_score !== undefined ? (
                      <div className="flex items-center justify-center gap-4">
                        <span>Club</span>
                        <span className="text-2xl">{match.our_score} - {match.rival_score}</span>
                        <span>{match.rival_team}</span>
                      </div>
                    ) : (
                      <span>vs {match.rival_team}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {match.match_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(match.match_time)} HS
                      </div>
                    )}
                    {match.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {match.location.name}
                      </div>
                    )}
                  </div>

                  {match.status === "completed" && getResultBadge(match)}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
