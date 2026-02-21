"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2, Eye, EyeOff, Sun, Moon, Save, X, Info, Copy, Search } from 'lucide-react'
import { ColorPicker } from "./color-picker"
import { SiteBanner } from "../site-banner"
import { SitePageSelector } from "./site-page-selector"
import type { Role } from "@/lib/permissions"

interface Banner {
  id: string
  name: string
  message: string
  link_url: string
  link_text: string
  show_button: boolean
  button_text: string
  bg_color_light: string
  bg_color_dark: string
  text_color_light: string
  text_color_dark: string
  button_bg_color_light: string
  button_bg_color_dark: string
  button_text_color_light: string
  button_text_color_dark: string
  target_audience: 'all' | 'guests' | 'authenticated' | 'roles'
  target_roles: number[]
  is_active: boolean
  priority: number
  frequency: 'once' | 'daily' | 'always' | 'session'
  is_visible_in_list?: boolean
}

interface BannerManagerProps {
  roles: Role[]
}

export function BannerManager({ roles }: BannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const [previewingBanner, setPreviewingBanner] = useState<Banner | null>(null)
  const [showPageSelector, setShowPageSelector] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('[v0] Error loading banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    const defaultBanner = banners.find(b => b.name.toLowerCase() === 'default')
    
    setEditingBanner({
      id: 'new',
      name: '',
      message: '',
      link_url: '',
      link_text: 'Ver más',
      show_button: true,
      button_text: 'Ir',
      bg_color_light: defaultBanner?.bg_color_light || '#2e8b58',
      bg_color_dark: defaultBanner?.bg_color_dark || '#ffd700',
      text_color_light: defaultBanner?.text_color_light || '#ffffff',
      text_color_dark: defaultBanner?.text_color_dark || '#000000',
      button_bg_color_light: defaultBanner?.button_bg_color_light || '#2e8b58',
      button_bg_color_dark: defaultBanner?.button_bg_color_dark || '#ffd700',
      button_text_color_light: defaultBanner?.button_text_color_light || '#ffffff',
      button_text_color_dark: defaultBanner?.button_text_color_dark || '#000000',
      target_audience: 'all',
      target_roles: [],
      is_active: false,
      priority: 100,
      frequency: 'always',
    })
  }

  const handleDuplicate = (banner: Banner) => {
    setEditingBanner({
      ...banner,
      id: 'new',
      name: `${banner.name} (copia)`,
      is_active: false,
    })
  }

  const handleSave = async () => {
    if (!editingBanner) return

    try {
      const url = editingBanner.id === 'new' 
        ? '/api/admin/banners'
        : `/api/admin/banners/${editingBanner.id}`
      
      const response = await fetch(url, {
        method: editingBanner.id === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner),
      })

      if (response.ok) {
        await loadBanners()
        setEditingBanner(null)
      }
    } catch (error) {
      console.error('[v0] Error saving banner:', error)
    }
  }

  const handleSaveWithoutClosing = async () => {
    if (!editingBanner) return

    if (!editingBanner.name || !editingBanner.message) {
      alert('Por favor completa los campos obligatorios: Nombre y Mensaje')
      return
    }

    try {
      const url = editingBanner.id === 'new' 
        ? '/api/admin/banners'
        : `/api/admin/banners/${editingBanner.id}`
      
      const response = await fetch(url, {
        method: editingBanner.id === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner),
      })

      const data = await response.json()

      if (response.ok) {
        await loadBanners()
        if (editingBanner.id === 'new' && data.banner?.id) {
          setEditingBanner({ ...editingBanner, id: data.banner.id })
        }
        alert('Banner guardado correctamente')
      } else {
        alert(`Error al guardar: ${data.details || data.error}`)
      }
    } catch (error) {
      console.error('[v0] Error saving banner:', error)
      alert('Error al guardar el banner.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return

    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      await loadBanners()
    } catch (error) {
      console.error('[v0] Error deleting banner:', error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      await loadBanners()
    } catch (error) {
      console.error('[v0] Error toggling banner:', error)
    }
  }

  if (editingBanner) {
    return (
      <Card className="border-2">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editingBanner.id === 'new' ? 'Crear Nuevo Banner' : 'Editar Banner'}</CardTitle>
              <CardDescription>Configura el contenido y audiencia del banner</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditingBanner(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del banner (interno) *</Label>
              <Input
                id="name"
                value={editingBanner.name || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, name: e.target.value })}
                placeholder="Banner de bienvenida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                value={editingBanner.message || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, message: e.target.value })}
                placeholder="Bienvenido al Club Carlos Casares"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label>Mostrar botón en el banner</Label>
              <Switch
                checked={editingBanner.show_button}
                onCheckedChange={(checked) => setEditingBanner({ ...editingBanner, show_button: checked })}
              />
            </div>

            {editingBanner.show_button && (
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Texto del botón</Label>
                  <Input
                    value={editingBanner.button_text || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, button_text: e.target.value })}
                    placeholder="Ir"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL del botón</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editingBanner.link_url || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                      placeholder="/registro"
                      className="flex-1"
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

          <Tabs defaultValue="light" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="light" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Modo Claro
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Modo Oscuro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Color de fondo del banner"
                  value={editingBanner.bg_color_light}
                  onChange={(value) => setEditingBanner({ ...editingBanner, bg_color_light: value })}
                />
                <ColorPicker
                  label="Color del texto"
                  value={editingBanner.text_color_light}
                  onChange={(value) => setEditingBanner({ ...editingBanner, text_color_light: value })}
                />
              </div>

              {editingBanner.show_button && (
                <div className="grid md:grid-cols-2 gap-4 pt-2 mt-4 border-t">
                  <ColorPicker
                    label="Color de fondo del botón"
                    value={editingBanner.button_bg_color_light}
                    onChange={(value) => setEditingBanner({ ...editingBanner, button_bg_color_light: value })}
                  />
                  <ColorPicker
                    label="Color del texto del botón"
                    value={editingBanner.button_text_color_light}
                    onChange={(value) => setEditingBanner({ ...editingBanner, button_text_color_light: value })}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="dark" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Color de fondo del banner"
                  value={editingBanner.bg_color_dark}
                  onChange={(value) => setEditingBanner({ ...editingBanner, bg_color_dark: value })}
                />
                <ColorPicker
                  label="Color del texto"
                  value={editingBanner.text_color_dark}
                  onChange={(value) => setEditingBanner({ ...editingBanner, text_color_dark: value })}
                />
              </div>

              {editingBanner.show_button && (
                <div className="grid md:grid-cols-2 gap-4 pt-2 mt-4 border-t">
                  <ColorPicker
                    label="Color de fondo del botón"
                    value={editingBanner.button_bg_color_dark}
                    onChange={(value) => setEditingBanner({ ...editingBanner, button_bg_color_dark: value })}
                  />
                  <ColorPicker
                    label="Color del texto del botón"
                    value={editingBanner.button_text_color_dark}
                    onChange={(value) => setEditingBanner({ ...editingBanner, button_text_color_dark: value })}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex flex-col gap-2">
              <Label htmlFor="target-audience">Audiencia objetivo</Label>
              <Select
                value={editingBanner.target_audience}
                onValueChange={(value: any) => setEditingBanner({ ...editingBanner, target_audience: value })}
              >
                <SelectTrigger id="target-audience">
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

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="priority">Prioridad</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold">Mayor número = Mayor prioridad</p>
                      <p className="text-xs mt-1">Los usuarios solo verán el banner de mayor prioridad para su audiencia/rol</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="priority"
                type="number"
                value={editingBanner.priority || 100}
                onChange={(e) => setEditingBanner({ ...editingBanner, priority: parseInt(e.target.value) || 100 })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="frequency">Frecuencia de visualización</Label>
              <Select
                value={editingBanner.frequency}
                onValueChange={(value: any) => setEditingBanner({ ...editingBanner, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Siempre que visite la página</SelectItem>
                  <SelectItem value="session">Una vez por sesión</SelectItem>
                  <SelectItem value="daily">Una vez al día</SelectItem>
                  <SelectItem value="once">Solo una vez</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {editingBanner.target_audience === 'roles' && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Label>Seleccionar roles (solo uno verá este banner)</Label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={editingBanner.target_roles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingBanner({
                            ...editingBanner,
                            target_roles: [...editingBanner.target_roles, role.id]
                          })
                        } else {
                          setEditingBanner({
                            ...editingBanner,
                            target_roles: editingBanner.target_roles.filter(r => r !== role.id)
                          })
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`role-${role.id}`} className="text-sm" style={{ color: role.color }}>
                      {role.display_name}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ Si un rol tiene múltiples banners asignados, solo verá el de mayor prioridad
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleSaveWithoutClosing}>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button onClick={handleSave} style={{ backgroundColor: '#2e8b58' }} className="hover:opacity-90">
                <Save className="mr-2 h-4 w-4" />
                Guardar y Cerrar
              </Button>
              <Button variant="destructive" onClick={() => setEditingBanner(null)}>
                Cancelar
              </Button>
            </div>
          </div>

          {showPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Modo de vista previa:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('light')}
                  >
                    <Sun className="mr-1 h-3 w-3" />
                    Claro
                  </Button>
                  <Button
                    variant={previewMode === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('dark')}
                  >
                    <Moon className="mr-1 h-3 w-3" />
                    Oscuro
                  </Button>
                </div>
              </div>
              <div className={`border-2 border-dashed rounded-lg overflow-hidden ${previewMode === 'dark' ? 'dark' : ''}`}>
                <div className={previewMode === 'dark' ? 'bg-background' : 'bg-white'}>
                  <SiteBanner
                    text={editingBanner.message}
                    link={editingBanner.link_url}
                    buttonText={editingBanner.button_text}
                    showButton={editingBanner.show_button}
                    color={editingBanner.bg_color_light}
                    textColor={editingBanner.text_color_light}
                    colorDark={editingBanner.bg_color_dark}
                    textColorDark={editingBanner.text_color_dark}
                    buttonColor={editingBanner.button_bg_color_light}
                    buttonColorDark={editingBanner.button_bg_color_dark}
                    buttonTextColor={editingBanner.button_text_color_light}
                    buttonTextColorDark={editingBanner.button_text_color_dark}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <SitePageSelector
          open={showPageSelector}
          onOpenChange={setShowPageSelector}
          onSelect={(path) => setEditingBanner({ ...editingBanner, link_url: path })}
          currentPath={editingBanner.link_url}
        />
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestor de Banners</CardTitle>
            <CardDescription>Administra múltiples banners con diferentes audiencias</CardDescription>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Banner
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando banners...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay banners creados. Crea tu primer banner haciendo clic en "Crear Banner"
          </div>
        ) : (
          <div className="space-y-3">
            {banners.filter(b => b.is_visible_in_list !== false).map((banner) => (
              <div key={banner.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{banner.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{banner.message}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {banner.target_audience === 'all' && 'Todos'}
                      {banner.target_audience === 'guests' && 'Invitados'}
                      {banner.target_audience === 'authenticated' && 'Autenticados'}
                      {banner.target_audience === 'roles' && `${banner.target_roles.length} roles`}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      Prioridad: {banner.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      Frecuencia: {banner.frequency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setPreviewingBanner(banner)} 
                    title="Vista previa"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDuplicate(banner)} title="Duplicar">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingBanner(banner)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {previewingBanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vista Previa: {previewingBanner.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewingBanner(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-2 border-dashed rounded-lg overflow-hidden">
              <SiteBanner
                text={previewingBanner.message}
                link={previewingBanner.link_url}
                buttonText={previewingBanner.button_text}
                showButton={previewingBanner.show_button}
                color={previewingBanner.bg_color_light}
                textColor={previewingBanner.text_color_light}
                colorDark={previewingBanner.bg_color_dark}
                textColorDark={previewingBanner.text_color_dark}
                buttonColor={previewingBanner.button_bg_color_light}
                buttonColorDark={previewingBanner.button_bg_color_dark}
                buttonTextColor={previewingBanner.button_text_color_light}
                buttonTextColorDark={previewingBanner.button_text_color_dark}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
