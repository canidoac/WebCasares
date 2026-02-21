"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2, Eye, Save, X, Info, Copy, Search } from 'lucide-react'
import { WelcomePopup } from "../welcome-popup"
import { MediaUploader } from "./media-uploader"
import { SitePageSelector } from "./site-page-selector"
import type { Role } from "@/lib/permissions"

interface Popup {
  id: string
  name: string
  title: string
  message: string
  image_url: string
  media_url?: string
  media_type?: 'image' | 'gif' | 'video'
  video_autoplay?: boolean
  video_muted?: boolean
  button_text: string
  button_link: string
  has_button: boolean
  opacity: number
  display_type: 'once' | 'daily' | 'always' | 'session'
  target_audience: 'all' | 'guests' | 'authenticated' | 'roles'
  target_roles: number[]
  is_active: boolean
  priority: number
  is_visible_in_list?: boolean
}

interface PopupManagerProps {
  roles: Role[]
}

export function PopupManager({ roles }: PopupManagerProps) {
  const [popups, setPopups] = useState<Popup[]>([])
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [opacityPercent, setOpacityPercent] = useState(80)
  const [previewingPopup, setPreviewingPopup] = useState<Popup | null>(null)
  const [showPageSelector, setShowPageSelector] = useState(false)

  useEffect(() => {
    loadPopups()
  }, [])

  useEffect(() => {
    if (editingPopup) {
      const percent = Math.round(editingPopup.opacity * 100)
      setOpacityPercent(percent)
      console.log('[v0] Popup loaded with opacity:', editingPopup.opacity, 'as percent:', percent)
    }
  }, [editingPopup?.id])

  const loadPopups = async () => {
    try {
      const response = await fetch('/api/admin/popups')
      const data = await response.json()
      console.log('[v0] Popups fetched successfully:', data.popups?.length)
      setPopups(data.popups || [])
    } catch (error) {
      console.error('[v0] Error loading popups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    const defaultPopup = popups.find(p => p.name.toLowerCase() === 'default')
    
    setEditingPopup({
      id: 'new',
      name: '',
      title: 'Bienvenido',
      message: '',
      image_url: '',
      media_url: defaultPopup?.media_url || '',
      media_type: defaultPopup?.media_type || 'image',
      video_autoplay: defaultPopup?.video_autoplay || false,
      video_muted: defaultPopup?.video_muted || true,
      button_text: 'Entendido',
      button_link: '',
      has_button: true,
      opacity: defaultPopup?.opacity || 0.8,
      display_type: 'once',
      target_audience: 'all',
      target_roles: [],
      is_active: false,
      priority: 100,
    })
    setOpacityPercent(Math.round((defaultPopup?.opacity || 0.8) * 100))
  }

  const handleSaveWithoutClosing = async () => {
    if (!editingPopup) return

    if (!editingPopup.name || !editingPopup.title || !editingPopup.message) {
      alert('Por favor completa los campos obligatorios: Nombre, Título y Mensaje')
      return
    }

    const popupToSave = {
      ...editingPopup,
      opacity: opacityPercent / 100,
      image_url: editingPopup.media_url || editingPopup.image_url
    }

    try {
      const url = editingPopup.id === 'new' 
        ? '/api/admin/popups'
        : `/api/admin/popups/${editingPopup.id}`
      
      const response = await fetch(url, {
        method: editingPopup.id === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(popupToSave),
      })

      const data = await response.json()

      if (response.ok) {
        await loadPopups()
        if (editingPopup.id === 'new' && data.popup?.id) {
          setEditingPopup({ ...editingPopup, id: data.popup.id })
        }
        alert('Popup guardado correctamente')
      } else {
        alert(`Error al guardar: ${data.details || data.error}`)
      }
    } catch (error) {
      console.error('[v0] Error saving popup:', error)
      alert('Error al guardar el popup. Revisa la consola para más detalles.')
    }
  }

  const handleSave = async () => {
    if (!editingPopup) return

    if (!editingPopup.name || !editingPopup.title || !editingPopup.message) {
      alert('Por favor completa los campos obligatorios: Nombre, Título y Mensaje')
      return
    }

    const popupToSave = {
      ...editingPopup,
      opacity: opacityPercent / 100,
      image_url: editingPopup.media_url || editingPopup.image_url
    }
    
    console.log('[v0] Saving popup with opacity:', opacityPercent, '% =', popupToSave.opacity)

    try {
      const url = editingPopup.id === 'new' 
        ? '/api/admin/popups'
        : `/api/admin/popups/${editingPopup.id}`
      
      console.log('[v0] Sending request to:', url)
      
      const response = await fetch(url, {
        method: editingPopup.id === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(popupToSave),
      })

      console.log('[v0] Response status:', response.status)
      
      const data = await response.json()
      console.log('[v0] Response data:', data)

      if (response.ok) {
        console.log('[v0] Popup saved successfully')
        await loadPopups()
        setEditingPopup(null)
      } else {
        console.error('[v0] Error response:', data)
        alert(`Error al guardar: ${data.details || data.error}`)
      }
    } catch (error) {
      console.error('[v0] Error saving popup:', error)
      alert('Error al guardar el popup. Revisa la consola para más detalles.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este popup?')) return

    try {
      await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' })
      await loadPopups()
    } catch (error) {
      console.error('[v0] Error deleting popup:', error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/popups/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      await loadPopups()
    } catch (error) {
      console.error('[v0] Error toggling popup:', error)
    }
  }

  const handleDuplicate = (popup: Popup) => {
    setEditingPopup({
      ...popup,
      id: 'new',
      name: `${popup.name} (copia)`,
      is_active: false,
    })
    setOpacityPercent(Math.round(popup.opacity * 100))
  }

  if (editingPopup) {
    return (
      <Card className="border-2">
        <CardHeader className="bg-background border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">{editingPopup.id === 'new' ? 'Crear Nuevo Popup' : 'Editar Popup'}</CardTitle>
              <CardDescription>Configura el contenido y audiencia del popup</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setEditingPopup(null)}
              className="h-10 w-10 rounded-full bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid lg:grid-cols-[1fr,380px] gap-6">
            {/* Columna izquierda: Campos principales */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nombre del popup (interno) *</Label>
                <Input
                  id="name"
                  value={editingPopup.name || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, name: e.target.value })}
                  placeholder="Popup de bienvenida"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Título *</Label>
                <Input
                  id="title"
                  value={editingPopup.title || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, title: e.target.value })}
                  placeholder="Bienvenido"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Mensaje *</Label>
                <Textarea
                  id="message"
                  value={editingPopup.message || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, message: e.target.value })}
                  placeholder="Nos alegra tenerte aquí..."
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Imagen, GIF o Video (opcional)</Label>
                <MediaUploader
                  currentUrl={editingPopup.media_url || editingPopup.image_url}
                  currentType={editingPopup.media_type || 'image'}
                  onMediaChange={(url, type) => setEditingPopup({ 
                    ...editingPopup, 
                    media_url: url,
                    media_type: type 
                  })}
                  maxSizeMB={5}
                  folder="club-carlos-casares/site/popups"
                />
              </div>
            </div>

            {/* Columna derecha: Opciones y configuración */}
            <div className="space-y-4">
              {/* Botón */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/5">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Botón</Label>
                  <Switch
                    checked={editingPopup.has_button}
                    onCheckedChange={(checked) => setEditingPopup({ ...editingPopup, has_button: checked })}
                  />
                </div>

                {editingPopup.has_button && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Texto del botón</Label>
                      <Input
                        value={editingPopup.button_text || ''}
                        onChange={(e) => setEditingPopup({ ...editingPopup, button_text: e.target.value })}
                        placeholder="Entendido"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">URL del botón (opcional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={editingPopup.button_link || ''}
                          onChange={(e) => setEditingPopup({ ...editingPopup, button_link: e.target.value })}
                          placeholder="/perfil"
                          className="bg-background flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowPageSelector(true)}
                          title="Seleccionar página del sitio"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Opciones de video */}
              {editingPopup.media_type === 'video' && editingPopup.media_url && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/5">
                  <Label className="text-base font-semibold">Opciones de video</Label>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="video-autoplay" className="text-sm font-normal">Auto-reproducir</Label>
                    <Switch
                      id="video-autoplay"
                      checked={editingPopup.video_autoplay || false}
                      onCheckedChange={(checked) => setEditingPopup({ ...editingPopup, video_autoplay: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="video-muted" className="text-sm font-normal">Iniciar sin sonido</Label>
                    <Switch
                      id="video-muted"
                      checked={editingPopup.video_muted !== false}
                      onCheckedChange={(checked) => setEditingPopup({ ...editingPopup, video_muted: checked })}
                    />
                  </div>
                </div>
              )}

              {/* Opacidad */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/5">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Opacidad del fondo</Label>
                  <span className="text-sm font-medium text-muted-foreground">{opacityPercent}%</span>
                </div>
                <Slider
                  value={[opacityPercent]}
                  onValueChange={(values) => setOpacityPercent(values[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Label className="text-base font-semibold">Extras</Label>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-audience-popup" className="text-sm">Audiencia objetivo</Label>
                <Select
                  value={editingPopup.target_audience}
                  onValueChange={(value: any) => setEditingPopup({ ...editingPopup, target_audience: value })}
                >
                  <SelectTrigger id="target-audience-popup" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="guests">Solo invitados (no autenticados)</SelectItem>
                    <SelectItem value="authenticated">Solo usuarios autenticados</SelectItem>
                    <SelectItem value="roles">Roles específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="priority-popup" className="text-sm">Prioridad</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold">Mayor número = Mayor prioridad</p>
                        <p className="text-xs mt-1">Los usuarios solo verán el popup de mayor prioridad</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="priority-popup"
                  type="number"
                  value={editingPopup.priority || 100}
                  onChange={(e) => setEditingPopup({ ...editingPopup, priority: parseInt(e.target.value) || 100 })}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_type" className="text-sm">Frecuencia de visualización</Label>
                <Select
                  value={editingPopup.display_type}
                  onValueChange={(value: any) => setEditingPopup({ ...editingPopup, display_type: value })}
                >
                  <SelectTrigger id="display_type" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Solo una vez (por navegador)</SelectItem>
                    <SelectItem value="session">Una vez por sesión</SelectItem>
                    <SelectItem value="daily">Una vez por día</SelectItem>
                    <SelectItem value="always">Siempre que visite la página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingPopup.target_audience === 'roles' && (
              <div className="mt-4 space-y-2 p-4 border rounded-lg bg-muted/5">
                <Label className="text-sm font-medium">Seleccionar roles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`popup-role-${role.id}`}
                        checked={editingPopup.target_roles.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingPopup({
                              ...editingPopup,
                              target_roles: [...editingPopup.target_roles, role.id]
                            })
                          } else {
                            setEditingPopup({
                              ...editingPopup,
                              target_roles: editingPopup.target_roles.filter(r => r !== role.id)
                            })
                          }
                        }}
                        className="rounded border-input"
                      />
                      <label htmlFor={`popup-role-${role.id}`} className="text-sm" style={{ color: role.color }}>
                        {role.display_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Mostrar Vista Previa
            </Button>

            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={handleSaveWithoutClosing}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-2 bg-[#2e8b58] hover:bg-[#26744a] text-white"
              >
                <Save className="h-4 w-4" />
                Guardar y Cerrar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setEditingPopup(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>

          {showPreview && (
            <WelcomePopup
              title={editingPopup.title}
              content={editingPopup.message}
              image={editingPopup.media_url || editingPopup.image_url}
              mediaType={editingPopup.media_type}
              videoAutoplay={editingPopup.video_autoplay}
              videoMuted={editingPopup.video_muted}
              buttonText={editingPopup.has_button ? editingPopup.button_text : undefined}
              buttonLink={editingPopup.has_button ? editingPopup.button_link : undefined}
              opacity={opacityPercent}
              forceOpen={true}
              onClose={() => setShowPreview(false)}
            />
          )}
        </CardContent>

        <SitePageSelector
          open={showPageSelector}
          onOpenChange={setShowPageSelector}
          onSelect={(path) => setEditingPopup({ ...editingPopup, button_link: path })}
          currentPath={editingPopup.button_link}
        />
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestor de Popups</CardTitle>
            <CardDescription>Administra múltiples popups con diferentes audiencias</CardDescription>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Popup
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando popups...</div>
        ) : popups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay popups creados. Crea tu primer popup haciendo clic en "Crear Popup"
          </div>
        ) : (
          <div className="space-y-3">
            {popups.filter(p => p.is_visible_in_list !== false).map((popup) => (
              <div key={popup.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{popup.name}</div>
                  <div className="text-sm text-muted-foreground">{popup.title}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {popup.target_audience === 'all' && 'Todos'}
                      {popup.target_audience === 'guests' && 'Invitados'}
                      {popup.target_audience === 'authenticated' && 'Autenticados'}
                      {popup.target_audience === 'roles' && `${popup.target_roles.length} roles`}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      Prioridad: {popup.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted capitalize">
                      {popup.display_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={popup.is_active}
                    onCheckedChange={(checked) => handleToggleActive(popup.id, checked)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setPreviewingPopup(popup)} 
                    title="Vista previa"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDuplicate(popup)} title="Duplicar">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingPopup(popup)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(popup.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {previewingPopup && (
          <WelcomePopup
            title={previewingPopup.title}
            content={previewingPopup.message}
            image={previewingPopup.media_url || previewingPopup.image_url}
            mediaType={previewingPopup.media_type}
            videoAutoplay={previewingPopup.video_autoplay}
            videoMuted={previewingPopup.video_muted}
            buttonText={previewingPopup.has_button ? previewingPopup.button_text : undefined}
            buttonLink={previewingPopup.has_button ? previewingPopup.button_link : undefined}
            opacity={Math.round(previewingPopup.opacity * 100)}
            forceOpen={true}
            onClose={() => setPreviewingPopup(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}
