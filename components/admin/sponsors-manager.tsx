"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Award, Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react'
import { createSponsor, updateSponsor, deleteSponsor, updateSponsorOrder } from "@/app/admin/sponsors/actions"
import { MediaUploader } from "./media-uploader"
import Image from "next/image"

interface Sponsor {
  id: number
  name: string
  logo_url: string
  website_url: string | null
  active: boolean
  display_order: number
}

export function SponsorsManager({ initialSponsors }: { initialSponsors: Sponsor[] }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    active: true,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      logo_url: "",
      website_url: "",
      active: true,
    })
    setIsEditing(null)
    setIsCreating(false)
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.logo_url) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    setLoading(true)
    try {
      await createSponsor(formData)
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al crear sponsor")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name || !formData.logo_url) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    setLoading(true)
    try {
      await updateSponsor(id, formData)
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar sponsor")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este sponsor?")) return

    setLoading(true)
    try {
      await deleteSponsor(id)
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar sponsor")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website_url: sponsor.website_url || "",
      active: sponsor.active,
    })
    setIsEditing(sponsor.id)
    setIsCreating(false)
  }

  const handleMoveUp = async (sponsor: Sponsor) => {
    const index = sponsors.findIndex(s => s.id === sponsor.id)
    if (index === 0) return

    setLoading(true)
    try {
      const prevSponsor = sponsors[index - 1]
      await updateSponsorOrder(sponsor.id, prevSponsor.display_order)
      await updateSponsorOrder(prevSponsor.id, sponsor.display_order)
      window.location.reload()
    } catch (error) {
      alert("Error al cambiar orden")
    } finally {
      setLoading(false)
    }
  }

  const handleMoveDown = async (sponsor: Sponsor) => {
    const index = sponsors.findIndex(s => s.id === sponsor.id)
    if (index === sponsors.length - 1) return

    setLoading(true)
    try {
      const nextSponsor = sponsors[index + 1]
      await updateSponsorOrder(sponsor.id, nextSponsor.display_order)
      await updateSponsorOrder(nextSponsor.id, sponsor.display_order)
      window.location.reload()
    } catch (error) {
      alert("Error al cambiar orden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Sponsors</h1>
            <p className="text-muted-foreground">Administra los patrocinadores del club</p>
          </div>
        </div>
        {!isCreating && !isEditing && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Sponsor
          </Button>
        )}
      </div>

      {(isCreating || isEditing) && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Sponsor" : "Nuevo Sponsor"}</CardTitle>
            <CardDescription>
              {isEditing ? "Modifica los datos del sponsor" : "Completa los datos del nuevo sponsor"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Sponsor *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Nike, Coca-Cola"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo del Sponsor *</Label>
              <MediaUploader
                currentUrl={formData.logo_url}
                currentType="image"
                onMediaChange={(url) => setFormData({ ...formData, logo_url: url })}
                folder="club-carlos-casares/sponsors"
                acceptedTypes="image/*"
                maxSizeMB={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web (opcional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Sponsor activo</Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => (isEditing ? handleUpdate(isEditing) : handleCreate())}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Guardar cambios" : "Crear sponsor"}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sponsors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay sponsors creados aún. Haz clic en "Nuevo Sponsor" para crear uno.
            </CardContent>
          </Card>
        ) : (
          sponsors.map((sponsor, index) => (
            <Card key={sponsor.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={sponsor.logo_url || "/placeholder.svg"}
                    alt={sponsor.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{sponsor.name}</h3>
                  {sponsor.website_url && (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {sponsor.website_url}
                    </a>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {sponsor.active ? "Activo" : "Inactivo"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveUp(sponsor)}
                    disabled={index === 0 || loading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveDown(sponsor)}
                    disabled={index === sponsors.length - 1 || loading}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(sponsor)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(sponsor.id)}
                    disabled={loading}
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
