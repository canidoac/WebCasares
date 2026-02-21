"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, UserPlus, Edit, X, Activity, Video, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SiteConfig } from "@/lib/site-config-types"
import { updateSiteConfig } from "@/app/admin/configuracion/actions"
import { ImageEditor } from "./image-editor"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SiteConfigFormProps {
  config: SiteConfig
  activeSection: "registro" | "estado"
}

export function SiteConfigForm({ config, activeSection }: SiteConfigFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [imageToEdit, setImageToEdit] = useState<string>("")
  const [currentImageField, setCurrentImageField] = useState<"maintenance" | "coming_soon" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<SiteConfig>({
    ...config,
    site_status: config.site_status || (config.maintenance_mode ? "maintenance" : "online"),
    maintenance_mode: config.maintenance_mode || false,
    maintenance_title: config.maintenance_title || "Sitio en Mantenimiento",
    maintenance_message: config.maintenance_message || "Estamos trabajando para mejorar tu experiencia. Vuelve pronto.",
    maintenance_media_type: config.maintenance_media_type || "none",
    maintenance_media_url: config.maintenance_media_url || "",
    maintenance_show_countdown: config.maintenance_show_countdown || false,
    maintenance_launch_date: config.maintenance_launch_date || "",
    coming_soon_title: config.coming_soon_title || "Próximamente",
    coming_soon_message: config.coming_soon_message || "Estamos preparando algo especial para ti. ¡Vuelve pronto!",
    coming_soon_image: config.coming_soon_image || "",
    coming_soon_launch_date: config.coming_soon_launch_date || "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImageToEdit(result)
      setShowImageEditor(true)
    }
    reader.readAsDataURL(file)
  }

  const handleImageSave = async (croppedImageUrl: string, file: File) => {
    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("folder", "club-carlos-casares/site")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al subir imagen")
      }

      if (currentImageField === "maintenance") {
        setFormData({ ...formData, maintenance_media_url: data.url })
      } else if (currentImageField === "coming_soon") {
        setFormData({ ...formData, coming_soon_image: data.url })
      }

      setShowImageEditor(false)
      setCurrentImageField(null)
      setImageToEdit("")
    } catch (err) {
      alert(`Error al subir la imagen: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setUploading(false)
    }
  }

  const handleEditImage = (field: "maintenance" | "coming_soon") => {
    const imageUrl = field === "maintenance" ? formData.maintenance_media_url : formData.coming_soon_image;
    if (imageUrl) {
      setImageToEdit(imageUrl)
      setCurrentImageField(field)
      setShowImageEditor(true)
    }
  }

  const handleRemoveImage = (field: "maintenance" | "coming_soon") => {
    if (field === "maintenance") {
      setFormData({ ...formData, maintenance_media_url: "" })
    } else if (field === "coming_soon") {
      setFormData({ ...formData, coming_soon_image: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent, redirectToHome = false) => {
    e.preventDefault()
    setLoading(true)

    const dataToSave: SiteConfig = {
      ...formData,
      maintenance_mode: formData.site_status === "maintenance",
    }

    const result = await updateSiteConfig(dataToSave)

    if (result.success) {
      if (redirectToHome) {
        router.push("/")
      } else {
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <>
      {showImageEditor && (
        <ImageEditor
          imageUrl={imageToEdit}
          onSave={handleImageSave}
          onCancel={() => {
            setShowImageEditor(false)
            setCurrentImageField(null)
          }}
          recommendedSize={{
            width: currentImageField === "maintenance" ? 1200 : 1000,
            height: currentImageField === "maintenance" ? 800 : 600,
            label: currentImageField === "maintenance" ? "Página de mantenimiento" : "Página de Próximamente",
          }}
        />
      )}

      <form className="space-y-6">
        {activeSection === "registro" && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Registro de Usuarios
              </CardTitle>
              <CardDescription className="mt-1">Controla si los usuarios pueden crear nuevas cuentas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <label className="text-sm font-medium">Habilitar registro público</label>
                <Switch
                  checked={formData.enable_registration}
                  onCheckedChange={(checked) => setFormData({ ...formData, enable_registration: checked })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "estado" && (
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Estado del Sitio
              </CardTitle>
              <CardDescription className="mt-1">
                Controla el estado de tu sitio web y qué ven los visitantes
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-status">Estado del sitio</Label>
                <Select
                  value={formData.site_status}
                  onValueChange={(value: "online" | "maintenance" | "coming_soon") =>
                    setFormData({ ...formData, site_status: value })
                  }
                >
                  <SelectTrigger id="site-status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[var(--club-verde)]" />
                        Online - Sitio funcionando normalmente
                      </div>
                    </SelectItem>
                    <SelectItem value="maintenance">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[var(--club-amarillo)]" />
                        Mantenimiento - Solo accesible para admins
                      </div>
                    </SelectItem>
                    <SelectItem value="coming_soon">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        Próximamente - Página de lanzamiento con countdown
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.site_status === "maintenance" && (
                <div className="space-y-4 p-4 bg-muted/50 border border-border rounded-lg">
                  <h4 className="font-medium text-sm">Configuración de Mantenimiento</h4>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-title">Título *</Label>
                    <Input
                      id="maintenance-title"
                      value={formData.maintenance_title || ""}
                      onChange={(e) => setFormData({ ...formData, maintenance_title: e.target.value })}
                      placeholder="Sitio en Mantenimiento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Mensaje *</Label>
                    <Textarea
                      id="maintenance-message"
                      value={formData.maintenance_message || ""}
                      onChange={(e) => setFormData({ ...formData, maintenance_message: e.target.value })}
                      placeholder="Estamos trabajando para mejorar tu experiencia. Vuelve pronto."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="media-type">Tipo de Media</Label>
                      <Select
                        value={formData.maintenance_media_type}
                        onValueChange={(value: "none" | "image" | "video") =>
                          setFormData({ ...formData, maintenance_media_type: value })
                        }
                      >
                        <SelectTrigger id="media-type">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin Media</SelectItem>
                          <SelectItem value="image">Imagen</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.maintenance_media_type !== "none" && (
                      <div className="space-y-3 pt-2">
                        {formData.maintenance_media_url ? (
                          <div className="flex gap-3 items-start">
                            <div className="relative w-32 h-24 border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {formData.maintenance_media_type === "image" ? (
                                <img
                                  src={formData.maintenance_media_url || "/placeholder.svg"}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-muted">
                                  <Video className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input
                                value={formData.maintenance_media_url || ""}
                                onChange={(e) => setFormData({ ...formData, maintenance_media_url: e.target.value })}
                                placeholder={`URL del ${formData.maintenance_media_type === "image" ? "imagen" : "video"}`}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                {formData.maintenance_media_type === "image" && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditImage("maintenance")}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Editar
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveImage("maintenance")}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Quitar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.maintenance_media_type === "image" && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setCurrentImageField("maintenance")
                                  fileInputRef.current?.click()
                                }}
                                disabled={uploading}
                                className="w-full"
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Subiendo...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Subir Imagen
                                  </>
                                )}
                              </Button>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                            <Input
                              value={formData.maintenance_media_url || ""}
                              onChange={(e) => setFormData({ ...formData, maintenance_media_url: e.target.value })}
                              placeholder={`URL del ${formData.maintenance_media_type === "image" ? "imagen" : "video"}`}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-countdown">Mostrar cuenta regresiva</Label>
                      <Switch
                        id="show-countdown"
                        checked={formData.maintenance_show_countdown}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, maintenance_show_countdown: checked })
                        }
                      />
                    </div>

                    {formData.maintenance_show_countdown && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="launch-date">Fecha de lanzamiento</Label>
                        <Input
                          id="launch-date"
                          type="datetime-local"
                          value={formData.maintenance_launch_date || ""}
                          onChange={(e) => setFormData({ ...formData, maintenance_launch_date: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          La cuenta regresiva mostrará el tiempo restante hasta esta fecha
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.site_status === "coming_soon" && (
                <div className="space-y-4 p-4 bg-muted/50 border border-border rounded-lg">
                  <h4 className="font-medium text-sm">Configuración de Próximamente</h4>
                  <div className="space-y-2">
                    <Label htmlFor="coming-soon-title">Título *</Label>
                    <Input
                      id="coming-soon-title"
                      value={formData.coming_soon_title || ""}
                      onChange={(e) => setFormData({ ...formData, coming_soon_title: e.target.value })}
                      placeholder="Próximamente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coming-soon-message">Mensaje *</Label>
                    <Textarea
                      id="coming-soon-message"
                      value={formData.coming_soon_message || ""}
                      onChange={(e) => setFormData({ ...formData, coming_soon_message: e.target.value })}
                      placeholder="Estamos preparando algo especial para ti. ¡Vuelve pronto!"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg">
                    <Label>Imagen de fondo (opcional)</Label>
                    {formData.coming_soon_image ? (
                      <div className="flex gap-3 items-start">
                        <div className="relative w-32 h-24 border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={formData.coming_soon_image || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={formData.coming_soon_image || ""}
                            onChange={(e) => setFormData({ ...formData, coming_soon_image: e.target.value })}
                            placeholder="URL de la imagen"
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditImage("coming_soon")}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveImage("coming_soon")}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Quitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setCurrentImageField("coming_soon")
                            fileInputRef.current?.click()
                          }}
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Subir Imagen
                            </>
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Input
                          value={formData.coming_soon_image || ""}
                          onChange={(e) => setFormData({ ...formData, coming_soon_image: e.target.value })}
                          placeholder="O ingresa una URL"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coming-soon-launch-date">Fecha de lanzamiento *</Label>
                    <Input
                      id="coming-soon-launch-date"
                      type="datetime-local"
                      value={formData.coming_soon_launch_date || ""}
                      onChange={(e) => setFormData({ ...formData, coming_soon_launch_date: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      El countdown mostrará meses, días, horas, minutos y segundos hasta esta fecha
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Aplicar Cambios"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="flex-1"
          >
            Aplicar y Salir
          </Button>
        </div>
      </form>
    </>
  )
}
