"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from 'lucide-react'
import { suggestIconForDiscipline, SportIcon } from "@/lib/sport-icons"
import { IconPicker } from "./icon-picker"
import { useRouter } from 'next/navigation'
import { 
  getDisciplines, 
  createDiscipline, 
  deleteDiscipline,
} from "@/app/admin/disciplinas/actions"

interface DisciplineImage {
  id: number
  image_url: string
  caption: string | null
  display_order: number
}

interface DisciplineStaff {
  id: number
  role: string
  name: string
  display_order: number
}

interface Discipline {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  foundation_year: number | null
  current_tournament: string | null
  player_count: number
  is_active: boolean
  display_order: number
  images: DisciplineImage[]
  staff: DisciplineStaff[]
}

export function DisciplinesManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newDiscipline, setNewDiscipline] = useState({
    name: '',
    description: '',
    icon: 'sports_soccer',
    foundation_year: new Date().getFullYear(),
    current_tournament: '',
  })

  useEffect(() => {
    loadDisciplines()
  }, [])

  const loadDisciplines = async () => {
    setLoading(true)
    try {
      const data = await getDisciplines()
      setDisciplines(data)
    } catch (error) {
      console.error('[v0] Error loading disciplines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscipline = async () => {
    if (!newDiscipline.name.trim()) {
      alert('El nombre es requerido')
      return
    }

    try {
      await createDiscipline(newDiscipline)
      setNewDiscipline({
        name: '',
        description: '',
        icon: 'sports_soccer',
        foundation_year: new Date().getFullYear(),
        current_tournament: '',
      })
      setShowNewForm(false)
      await loadDisciplines()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error creating discipline:', error)
      alert('Error al crear disciplina')
    }
  }

  const handleDeleteDiscipline = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta disciplina?')) return

    try {
      await deleteDiscipline(id)
      await loadDisciplines()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting discipline:', error)
      alert('Error al eliminar disciplina')
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Cargando...</CardContent></Card>
  }

  return (
    <div className="space-y-4">
      {/* Add New Discipline Button */}
      <Card>
        <CardContent className="p-6">
          {!showNewForm ? (
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Disciplina
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Nueva Disciplina</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={newDiscipline.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const suggestedIcon = suggestIconForDiscipline(name)
                      setNewDiscipline(prev => ({ ...prev, name, icon: suggestedIcon }))
                    }}
                    placeholder="Ej: Fútbol 11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icono</Label>
                  <IconPicker
                    value={newDiscipline.icon}
                    onChange={(icon) => setNewDiscipline(prev => ({ ...prev, icon }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Año de Fundación</Label>
                  <Input
                    type="number"
                    value={newDiscipline.foundation_year}
                    onChange={(e) => setNewDiscipline(prev => ({ ...prev, foundation_year: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Torneo Actual</Label>
                  <Input
                    value={newDiscipline.current_tournament}
                    onChange={(e) => setNewDiscipline(prev => ({ ...prev, current_tournament: e.target.value }))}
                    placeholder="Liga Regional Amateur"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={newDiscipline.description}
                    onChange={(e) => setNewDiscipline(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción de la disciplina..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateDiscipline}>Crear</Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {disciplines.map((discipline) => (
        <Card 
          key={discipline.id} 
          className="hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => router.push(`/admin/disciplinas/${discipline.id}`)}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icono de la disciplina */}
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <SportIcon icon={discipline.icon} size={28} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{discipline.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${discipline.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {discipline.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {discipline.description || 'Sin descripción'}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  {discipline.foundation_year && (
                    <span>Fundada en {discipline.foundation_year}</span>
                  )}
                  <span>{discipline.player_count || 0} jugadores</span>
                  {discipline.staff?.length > 0 && (
                    <span>{discipline.staff.length} miembros del staff</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteDiscipline(discipline.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
