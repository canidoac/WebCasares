"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"

interface Tournament {
  id: number
  name: string
  description: string | null
  year: number
  url: string | null
  category: string | null
  division: string | null
  discipline_id: number | null
  is_active: boolean
  discipline?: { name: string }
}

interface Discipline {
  id: number
  name: string
}

export function TournamentsManager() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: new Date().getFullYear(),
    url: '',
    category: '',
    division: '',
    discipline_id: '',
    is_active: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const [{ data: tournamentsData }, { data: disciplinesData }] = await Promise.all([
        supabase
          .from('Tournaments')
          .select('*, discipline:Disciplines(name)')
          .order('year', { ascending: false }),
        supabase
          .from('Disciplines')
          .select('id, name')
          .order('name')
      ])

      setTournaments(tournamentsData || [])
      setDisciplines(disciplinesData || [])
    } catch (error) {
      console.error('[v0] Error loading tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()
    const data = {
      ...formData,
      discipline_id: formData.discipline_id ? parseInt(formData.discipline_id) : null,
      url: formData.url || null,
      category: formData.category || null,
      division: formData.division || null,
    }

    try {
      if (editing) {
        await supabase
          .from('Tournaments')
          .update(data)
          .eq('id', editing)
      } else {
        await supabase
          .from('Tournaments')
          .insert(data)
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error('[v0] Error saving tournament:', error)
    }
  }

  const handleEdit = (tournament: Tournament) => {
    setEditing(tournament.id)
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      year: tournament.year,
      url: tournament.url || '',
      category: tournament.category || '',
      division: tournament.division || '',
      discipline_id: tournament.discipline_id?.toString() || '',
      is_active: tournament.is_active,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este torneo?')) return

    const supabase = createClient()
    await supabase.from('Tournaments').delete().eq('id', id)
    loadData()
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      name: '',
      description: '',
      year: new Date().getFullYear(),
      url: '',
      category: '',
      division: '',
      discipline_id: '',
      is_active: true,
    })
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editing ? 'Editar Torneo' : 'Nuevo Torneo'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre del Torneo *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Año *</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoría</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Primera División"
              />
            </div>
            <div>
              <Label>División</Label>
              <Input
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="Ej: Zona A"
              />
            </div>
          </div>

          <div>
            <Label>URL del Torneo</Label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Disciplina</Label>
            <select
              className="w-full p-2 border rounded"
              value={formData.discipline_id}
              onChange={(e) => setFormData({ ...formData, discipline_id: e.target.value })}
            >
              <option value="">Todas las disciplinas</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Torneo Activo</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editing ? 'Actualizar' : 'Crear'} Torneo
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Lista de Torneos */}
      <div className="grid gap-4">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{tournament.name}</h4>
                  <span className="text-sm text-muted-foreground">({tournament.year})</span>
                  {tournament.url && (
                    <a href={tournament.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${tournament.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted'}`}>
                    {tournament.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {tournament.description && (
                  <p className="text-sm text-muted-foreground mt-1">{tournament.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm">
                  {tournament.category && <span>Categoría: {tournament.category}</span>}
                  {tournament.division && <span>División: {tournament.division}</span>}
                  {tournament.discipline && <span>Disciplina: {tournament.discipline.name}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(tournament)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(tournament.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
