"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { getClubInfo, updateClubInfo } from "@/app/admin/club/actions"

export function ClubInfoManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    history_title: '',
    history_content: '',
    history_image_url: '',
  })

  useEffect(() => {
    loadClubInfo()
  }, [])

  const loadClubInfo = async () => {
    setLoading(true)
    try {
      const data = await getClubInfo()
      if (data) {
        setFormData({
          history_title: data.history_title || '',
          history_content: data.history_content || '',
          history_image_url: data.history_image_url || '',
        })
      }
    } catch (error) {
      console.error('[v0] Error loading club info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateClubInfo(formData)
      router.refresh()
      alert('Información del club actualizada correctamente')
    } catch (error) {
      console.error('[v0] Error saving club info:', error)
      alert('Error al guardar la información')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Cargando...</CardContent></Card>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="history_title">Título de la Historia</Label>
            <Input
              id="history_title"
              value={formData.history_title}
              onChange={(e) => setFormData(prev => ({ ...prev, history_title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="history_content">Contenido de la Historia</Label>
            <Textarea
              id="history_content"
              value={formData.history_content}
              onChange={(e) => setFormData(prev => ({ ...prev, history_content: e.target.value }))}
              className="min-h-[300px]"
              required
            />
            <p className="text-sm text-muted-foreground">
              Usa doble salto de línea para separar párrafos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="history_image_url">URL de la Imagen</Label>
            <Input
              id="history_image_url"
              value={formData.history_image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, history_image_url: e.target.value }))}
              placeholder="/placeholder.svg"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
