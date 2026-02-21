"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Pencil, Trash2, MapPin, ExternalLink } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"

interface Location {
  id: number
  name: string
  google_maps_url: string | null
  city: string | null
  discipline_id: number | null
  is_active: boolean
  discipline?: { name: string }
}

interface Discipline {
  id: number
  name: string
}

export function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    google_maps_url: '',
    city: '',
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
      
      const [{ data: locationsData }, { data: disciplinesData }] = await Promise.all([
        supabase
          .from('Locations')
          .select('*, discipline:Disciplines(name)')
          .order('name'),
        supabase
          .from('Disciplines')
          .select('id, name')
          .order('name')
      ])

      setLocations(locationsData || [])
      setDisciplines(disciplinesData || [])
    } catch (error) {
      console.error('[v0] Error loading locations:', error)
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
      google_maps_url: formData.google_maps_url || null,
      city: formData.city || null,
    }

    try {
      if (editing) {
        await supabase
          .from('Locations')
          .update(data)
          .eq('id', editing)
      } else {
        await supabase
          .from('Locations')
          .insert(data)
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error('[v0] Error saving location:', error)
    }
  }

  const handleEdit = (location: Location) => {
    setEditing(location.id)
    setFormData({
      name: location.name,
      google_maps_url: location.google_maps_url || '',
      city: location.city || '',
      discipline_id: location.discipline_id?.toString() || '',
      is_active: location.is_active,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return

    const supabase = createClient()
    await supabase.from('Locations').delete().eq('id', id)
    loadData()
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      name: '',
      google_maps_url: '',
      city: '',
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
          {editing ? 'Editar Ubicación' : 'Nueva Ubicación'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre de la Ubicación *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Estadio del Club"
                required
              />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ej: Buenos Aires"
              />
            </div>
          </div>

          <div>
            <Label>Link de Google Maps</Label>
            <Input
              type="url"
              value={formData.google_maps_url}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Copia el enlace desde Google Maps para que se pueda abrir la ubicación
            </p>
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
            <Label>Ubicación Activa</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editing ? 'Actualizar' : 'Crear'} Ubicación
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Lista de Ubicaciones */}
      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <h4 className="font-semibold">{location.name}</h4>
                  {location.google_maps_url && (
                    <a href={location.google_maps_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${location.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted'}`}>
                    {location.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  {location.city && <span>Ciudad: {location.city}</span>}
                  {location.discipline && <span>Disciplina: {location.discipline.name}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(location)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(location.id)}>
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
