"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity, Loader2, CheckCircle2, AlertCircle, Clock, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { MediaUploader } from "./media-uploader"
import { SitePageSelector } from "./site-page-selector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SiteStatus = {
  id: number
  status_key: 'online' | 'maintenance' | 'coming_soon'
  title: string
  message: string
  media_type: 'none' | 'image' | 'video'
  media_url: string | null
  show_countdown: boolean
  launch_date: string | null
  status_color: string
  redirect_url: string | null
  auto_switch_to_online: boolean
  final_video_url: string | null
  created_at: string
  updated_at: string
}

export function SiteStatusManager() {
  const [statuses, setStatuses] = useState<SiteStatus[]>([])
  const [activeStatusId, setActiveStatusId] = useState<number | null>(null)
  const [editingStatusKey, setEditingStatusKey] = useState<string>('online')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPageSelector, setShowPageSelector] = useState(false)

  useEffect(() => {
    fetchStatuses()
  }, [])

  const fetchStatuses = async () => {
    try {
      const response = await fetch("/api/admin/site-status")
      if (!response.ok) throw new Error("Error al obtener estados")
      
      const data = await response.json()
      setStatuses(data.statuses)
      setActiveStatusId(data.activeStatusId)
    } catch (error) {
      console.error("[v0] Error fetching statuses:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = {
    online: {
      label: "Online",
      description: "Sitio funcionando normalmente",
      icon: CheckCircle2,
    },
    maintenance: {
      label: "Mantenimiento",
      description: "Solo /admin/login accesible",
      icon: AlertCircle,
    },
    coming_soon: {
      label: "Próximamente",
      description: "Todas las páginas excepto /login con countdown",
      icon: Clock,
    },
  }

  const editingStatus = statuses.find(s => s.status_key === editingStatusKey)
  const activeStatus = statuses.find(s => s.id === activeStatusId)

  const updateEditingStatus = (updates: Partial<SiteStatus>) => {
    if (!editingStatus) return
    
    setStatuses(prev => prev.map(s => 
      s.id === editingStatus.id ? { ...s, ...updates } : s
    ))
    setHasChanges(true)
  }

  const handleSaveConfiguration = async () => {
    if (!editingStatus) return
    
    setSaving(true)
    try {
      const response = await fetch("/api/admin/site-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusId: editingStatus.id,
          title: editingStatus.title,
          message: editingStatus.message,
          media_type: editingStatus.media_type,
          media_url: editingStatus.media_url,
          show_countdown: editingStatus.show_countdown,
          launch_date: editingStatus.launch_date,
          redirect_url: editingStatus.redirect_url,
          auto_switch_to_online: editingStatus.auto_switch_to_online,
          final_video_url: editingStatus.final_video_url,
        })
      })

      if (!response.ok) throw new Error("Error al guardar")

      setHasChanges(false)
      alert("Configuración guardada correctamente")
      await fetchStatuses()
    } catch (error) {
      alert("Error al guardar las configuraciones")
    } finally {
      setSaving(false)
    }
  }

  const handleApplyStatus = async (statusId: number) => {
    setApplying(true)
    try {
      const response = await fetch("/api/admin/site-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeStatusId: statusId })
      })

      if (!response.ok) throw new Error("Error al aplicar estado")

      const status = statuses.find(s => s.id === statusId)
      const info = status ? statusInfo[status.status_key] : null
      
      setActiveStatusId(statusId)
      alert(`Estado "${info?.label}" aplicado al sitio`)
    } catch (error) {
      alert("Error al aplicar el estado del sitio")
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Estado actual */}
      <Card className="border-2">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Estado Actual del Sitio</CardTitle>
                <CardDescription>
                  Aplicar un estado cambia inmediatamente cómo ven el sitio los usuarios
                </CardDescription>
              </div>
            </div>
            {activeStatus && (
              <Badge 
                className="text-white font-medium px-4 py-2 flex items-center gap-2"
                style={{ backgroundColor: activeStatus.status_color }}
              >
                {React.createElement(statusInfo[activeStatus.status_key].icon, { className: "h-4 w-4" })}
                {statusInfo[activeStatus.status_key].label}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statuses.map((status) => {
              const info = statusInfo[status.status_key]
              const Icon = info.icon
              const isActive = status.id === activeStatusId
              
              return (
                <Button
                  key={status.id}
                  onClick={() => handleApplyStatus(status.id)}
                  disabled={applying || isActive}
                  variant={isActive ? "default" : "outline"}
                  className="h-auto py-4 flex-col items-start gap-2"
                  style={isActive ? { backgroundColor: status.status_color, borderColor: status.status_color } : {}}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: status.status_color }}
                    />
                    <span className="font-semibold">{info.label}</span>
                  </div>
                  <span className="text-xs opacity-80 text-left">
                    {info.description}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Editor de configuraciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Editar Configuración de Estados</CardTitle>
              <CardDescription>
                Personaliza los mensajes y medios para cada estado del sitio
              </CardDescription>
            </div>
            <div className="w-[240px]">
              <Select value={editingStatusKey} onValueChange={setEditingStatusKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => {
                    const info = statusInfo[status.status_key]
                    return (
                      <SelectItem key={status.status_key} value={status.status_key}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.status_color }} />
                          {info.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {editingStatus && (
            <>
              {editingStatusKey === "online" && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: editingStatus.status_color }} />
                  <p className="font-medium">Estado Online</p>
                  <p className="text-sm mt-2">
                    El sitio está funcionando normalmente, no requiere configuración adicional
                  </p>
                </div>
              )}

              {editingStatusKey !== "online" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editingStatus.title || ''}
                      onChange={(e) => updateEditingStatus({ title: e.target.value })}
                      placeholder="Título del mensaje"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={editingStatus.message || ''}
                      onChange={(e) => updateEditingStatus({ message: e.target.value })}
                      placeholder="Mensaje descriptivo"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg bg-muted/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Imagen o Video (opcional)</Label>
                      <Switch
                        id="enable-media"
                        checked={(editingStatus.media_type !== 'none' && editingStatus.media_url !== null)}
                        onCheckedChange={(checked) => {
                          console.log("[v0] Toggle media:", checked)
                          if (!checked) {
                            updateEditingStatus({ media_type: 'none', media_url: null })
                          } else {
                            updateEditingStatus({ media_type: 'image', media_url: '' })
                          }
                        }}
                      />
                    </div>
                    
                    {(editingStatus.media_type !== 'none' && editingStatus.media_url !== null) && (
                      <MediaUploader
                        currentUrl={editingStatus.media_url || ''}
                        currentType={editingStatus.media_type}
                        onMediaChange={(url, type) => {
                          updateEditingStatus({ 
                            media_url: url, 
                            media_type: type === 'youtube' || type === 'video' ? 'video' : type as 'none' | 'image' | 'video'
                          })
                        }}
                        maxSizeMB={30}
                        folder="club-carlos-casares/site/maintenance"
                      />
                    )}
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg bg-muted/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Video final (opcional)</Label>
                      <Switch
                        id="enable-final-video"
                        checked={!!editingStatus.final_video_url}
                        onCheckedChange={(checked) => {
                          console.log("[v0] Toggle final video:", checked)
                          if (!checked) {
                            updateEditingStatus({ final_video_url: null })
                          } else {
                            updateEditingStatus({ final_video_url: '' })
                          }
                        }}
                      />
                    </div>
                    
                    {editingStatus.final_video_url !== null && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Se mostrará en pantalla completa antes de redirigir
                        </p>
                        <MediaUploader
                          currentUrl={editingStatus.final_video_url || ''}
                          currentType="video"
                          onMediaChange={(url) => updateEditingStatus({ final_video_url: url })}
                          maxSizeMB={50}
                          folder="club-carlos-casares/site/videos"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="countdown"
                      checked={editingStatus.show_countdown || false}
                      onCheckedChange={(checked) => updateEditingStatus({ show_countdown: checked })}
                    />
                    <Label htmlFor="countdown">Mostrar cuenta regresiva</Label>
                  </div>

                  {editingStatus.show_countdown && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="launch-date">Fecha de lanzamiento</Label>
                        <Input
                          id="launch-date"
                          type="datetime-local"
                          value={editingStatus.launch_date ? new Date(editingStatus.launch_date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateEditingStatus({ launch_date: e.target.value })}
                        />
                      </div>

                      <div className="space-y-3 p-4 border rounded-lg bg-muted/5">
                        <Label className="text-base font-semibold">Cuando termine el contador</Label>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="auto-switch"
                            checked={editingStatus.auto_switch_to_online || false}
                            onCheckedChange={(checked) => updateEditingStatus({ auto_switch_to_online: checked })}
                          />
                          <Label htmlFor="auto-switch">Cambiar sitio a "Online" automáticamente</Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="redirect-url">URL de redirección</Label>
                          <div className="flex gap-2">
                            <Input
                              id="redirect-url"
                              value={editingStatus.redirect_url || ''}
                              onChange={(e) => updateEditingStatus({ redirect_url: e.target.value })}
                              placeholder="/inicio"
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
                    </>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      {hasChanges && editingStatusKey !== 'online' && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Tienes cambios sin guardar en la configuración
              </p>
              <Button onClick={handleSaveConfiguration} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Configuraciones"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selector de página */}
      <SitePageSelector
        open={showPageSelector}
        onOpenChange={setShowPageSelector}
        onSelect={(path) => updateEditingStatus({ redirect_url: path })}
        currentPath={editingStatus?.redirect_url || ''}
      />
    </div>
  )
}
