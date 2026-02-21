"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateDiscipline } from "@/app/admin/disciplinas/actions"
import { useRouter } from 'next/navigation'
import { IconPicker } from "@/components/admin/icon-picker"

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
}

interface DisciplineInfoTabProps {
  discipline: Discipline
  onUpdate: () => void
}

export function DisciplineInfoTab({ discipline, onUpdate }: DisciplineInfoTabProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(discipline)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDiscipline(discipline.id, formData)
      onUpdate()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error updating discipline:', error)
      alert('Error al actualizar disciplina')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Información General</h2>
        <p className="text-muted-foreground">Edita los datos básicos de la disciplina</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos Básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icono</Label>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div className="space-y-2">
              <Label>Año de Fundación</Label>
              <Input
                type="number"
                value={formData.foundation_year || ''}
                onChange={(e) => setFormData({ ...formData, foundation_year: parseInt(e.target.value) || null })}
              />
            </div>
            <div className="space-y-2">
              <Label>Jugadores Activos</Label>
              <Input
                type="number"
                value={formData.player_count}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Se calcula automáticamente</p>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Torneo Actual</Label>
              <Input
                value={formData.current_tournament || ''}
                onChange={(e) => setFormData({ ...formData, current_tournament: e.target.value })}
                placeholder="Liga Regional Amateur"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la disciplina..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Disciplina Activa</Label>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
