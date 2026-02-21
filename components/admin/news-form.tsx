"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createNews, updateNews, type NewsFormData } from "@/app/admin/noticias/actions"
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, ImagePlus, X } from 'lucide-react'
import { MediaUploader } from "./media-uploader"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface NewsFormProps {
  news?: {
    id: number
    title: string
    description: string
    short_description?: string
    content_html?: string
    image_url: string
    media_type?: 'image' | 'gif' | 'video' | 'youtube'
    thumbnail_url?: string
    action_text?: string
    action_url?: string
    active: boolean
    show_in_carousel?: boolean
    comments_locked?: boolean
    display_order: number
    starts_at?: string
    expires_at?: string
    images?: Array<{ image_url: string; media_type?: string; is_primary: boolean; position: number }>
    disciplines?: Array<{ id: number; name: string }>
  }
  disciplines?: Array<{ id: number; name: string; slug: string }>
  onSuccess?: () => void
}

function utcToArgentina(utcDate: string): string {
  if (!utcDate) return ""
  const date = new Date(utcDate)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours() - 3).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function argentinaToUtc(argDate: string): string {
  if (!argDate) return ""
  const date = new Date(argDate)
  date.setHours(date.getHours() + 3)
  return date.toISOString()
}

export function NewsForm({ news, disciplines = [], onSuccess }: NewsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<Array<{url: string, type: 'image' | 'gif' | 'video' | 'youtube'}>>(
    news?.images?.filter(img => !img.is_primary).map(img => ({
      url: img.image_url,
      type: (img.media_type as 'image' | 'gif' | 'video' | 'youtube') || 'image'
    })) || []
  )
  const [useStartDate, setUseStartDate] = useState(!!news?.starts_at)
  const [useExpireDate, setUseExpireDate] = useState(!!news?.expires_at)
  const [selectedDisciplines, setSelectedDisciplines] = useState<number[]>(
    news?.disciplines?.map(d => d.id) || []
  )

  const [formData, setFormData] = useState<NewsFormData>({
    title: news?.title || "",
    description: news?.description || "",
    short_description: news?.short_description || "",
    content_html: news?.content_html || "",
    image_url: news?.image_url || "",
    media_type: news?.media_type || 'image',
    thumbnail_url: news?.thumbnail_url || "",
    action_text: news?.action_text || "",
    action_url: news?.action_url || "",
    active: news?.active ?? true,
    show_in_carousel: news?.show_in_carousel ?? true,
    comments_locked: news?.comments_locked ?? false,
    display_order: news?.display_order || 0,
    starts_at: news?.starts_at ? utcToArgentina(news.starts_at) : "",
    expires_at: news?.expires_at ? utcToArgentina(news.expires_at) : "",
  })

  const handleMainMediaChange = (url: string, type: 'image' | 'gif' | 'video' | 'youtube') => {
    setFormData({ ...formData, image_url: url, media_type: type })
  }

  const [showAdditionalUploader, setShowAdditionalUploader] = useState(false)

  const handleAdditionalMediaChange = (url: string, type: 'image' | 'gif' | 'video' | 'youtube') => {
    setAdditionalImages([...additionalImages, { url, type }])
    setShowAdditionalUploader(false)
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.title || !formData.description || !formData.image_url) {
        throw new Error("Título, descripción e imagen son obligatorios")
      }

      if (formData.media_type === 'youtube' && !formData.thumbnail_url) {
        throw new Error("Los videos de YouTube requieren una imagen de portada para mostrar en las tarjetas de noticias")
      }

      const allImages = [
        { url: formData.image_url, type: formData.media_type },
        ...additionalImages
      ]
      
      const dataToSave = {
        ...formData,
        starts_at: useStartDate && formData.starts_at ? argentinaToUtc(formData.starts_at) : "",
        expires_at: useExpireDate && formData.expires_at ? argentinaToUtc(formData.expires_at) : "",
        images: allImages.map((img, index) => ({
          image_url: img.url,
          media_type: img.type,
          is_primary: index === 0,
          position: index
        })),
        disciplines: selectedDisciplines
      }

      let result
      if (news?.id) {
        result = await updateNews(news.id, dataToSave)
      } else {
        result = await createNews(dataToSave)
      }

      if (result.success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/admin/noticias")
          router.refresh()
        }
      } else {
        throw new Error("Error al guardar la noticia")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  const isVideoMedia = formData.media_type === 'video' || formData.media_type === 'youtube'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{news ? "Editar Noticia" : "Nueva Noticia"}</CardTitle>
        <CardDescription>
          {news ? "Modifica los datos de la noticia" : "Completa los datos para crear una nueva noticia"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Título de la noticia"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="display_order" className="text-sm font-medium">
                Orden
              </label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="short_description" className="text-sm font-medium">
              Descripción corta (para carrusel)
            </label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Texto breve que se mostrará en el carrusel (máx. 150 caracteres)"
              rows={2}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {formData.short_description?.length || 0}/150 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción completa *
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Descripción de la noticia en texto plano"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content_html" className="text-sm font-medium">
              Contenido con formato (HTML - opcional)
            </label>
            <Textarea
              id="content_html"
              value={formData.content_html}
              onChange={(e) => setFormData({ ...formData, content_html: e.target.value })}
              placeholder="<p>Contenido con formato HTML para personalizar la noticia...</p>"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Puedes usar HTML para agregar formato: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;h2&gt;, etc.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Imagen o Video principal *</label>
            <MediaUploader
              currentUrl={formData.image_url}
              currentType={formData.media_type}
              onMediaChange={handleMainMediaChange}
              maxSizeMB={10}
              folder="club-carlos-casares/news"
              acceptedTypes="image/*,video/mp4,video/webm"
            />
            <p className="text-xs text-muted-foreground">
              Sube una imagen, GIF, video o ingresa URL de YouTube/Vimeo para el carrusel
            </p>
          </div>

          {isVideoMedia && (
            <div className="space-y-2 border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
              <label className="text-sm font-medium flex items-center gap-2 text-primary">
                <ImagePlus className="h-5 w-5" />
                Imagen de portada {formData.media_type === 'youtube' && <span className="text-destructive">*</span>}
              </label>
              <p className="text-sm text-foreground/80">
                {formData.media_type === 'youtube' 
                  ? "Esta imagen es obligatoria y se mostrará en las tarjetas de noticias. El video de YouTube se reproducirá en el carrusel principal."
                  : "Esta imagen se mostrará en las tarjetas de noticias. Si no subes una, se usará el video."}
              </p>
              <MediaUploader
                currentUrl={formData.thumbnail_url}
                currentType="image"
                onMediaChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                maxSizeMB={5}
                folder="club-carlos-casares/news/thumbnails"
                acceptedTypes="image/*"
              />
              {formData.media_type === 'youtube' && !formData.thumbnail_url && (
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Debes subir una imagen de portada para poder guardar esta noticia
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Imágenes o Videos adicionales (opcional)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {additionalImages.map((media, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    {media.type === 'video' || media.type === 'youtube' ? (
                      <video src={media.url} className="w-full h-full object-cover" />
                    ) : (
                      <Image
                        src={media.url || "/placeholder.svg"}
                        alt={`Media ${index + 2}`}
                        fill
                        className="object-cover"
                        unoptimized={media.type === 'gif'}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAdditionalImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {additionalImages.length < 4 && !showAdditionalUploader && (
                <Button
                  type="button"
                  variant="outline"
                  className="aspect-video border-dashed"
                  onClick={() => setShowAdditionalUploader(true)}
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
              )}
            </div>
            {showAdditionalUploader && (
              <div className="border rounded-lg p-4">
                <MediaUploader
                  onMediaChange={handleAdditionalMediaChange}
                  maxSizeMB={10}
                  folder="club-carlos-casares/news"
                  acceptedTypes="image/*,video/mp4,video/webm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowAdditionalUploader(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Puedes agregar hasta 4 imágenes/videos adicionales para mostrar en la noticia completa
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disciplinas relacionadas</label>
            <Select
              onValueChange={(value) => {
                const disciplineId = parseInt(value)
                if (!selectedDisciplines.includes(disciplineId)) {
                  setSelectedDisciplines([...selectedDisciplines, disciplineId])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona disciplinas..." />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((discipline) => (
                  <SelectItem 
                    key={discipline.id} 
                    value={discipline.id.toString()}
                    disabled={selectedDisciplines.includes(discipline.id)}
                  >
                    {discipline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDisciplines.map((disciplineId) => {
                const discipline = disciplines.find(d => d.id === disciplineId)
                if (!discipline) return null
                return (
                  <Badge key={disciplineId} variant="secondary" className="gap-2">
                    {discipline.name}
                    <button
                      type="button"
                      onClick={() => setSelectedDisciplines(selectedDisciplines.filter(id => id !== disciplineId))}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Relaciona esta noticia con disciplinas para que aparezca en sus páginas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="action_text" className="text-sm font-medium">
                Texto del Botón
              </label>
              <Input
                id="action_text"
                value={formData.action_text}
                onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                placeholder="Ej: Ver más"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="action_url" className="text-sm font-medium">
                URL del Botón
              </label>
              <Input
                id="action_url"
                value={formData.action_url}
                onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label htmlFor="use-start-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de activación
                </label>
                <Switch
                  id="use-start-date"
                  checked={useStartDate}
                  onCheckedChange={(checked) => {
                    setUseStartDate(checked)
                    if (!checked) setFormData({ ...formData, starts_at: "" })
                  }}
                />
              </div>
              {useStartDate && (
                <Input
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  className="text-sm"
                />
              )}
            </div>

            <div className="space-y-2 border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label htmlFor="use-expire-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de expiración
                </label>
                <Switch
                  id="use-expire-date"
                  checked={useExpireDate}
                  onCheckedChange={(checked) => {
                    setUseExpireDate(checked)
                    if (!checked) setFormData({ ...formData, expires_at: "" })
                  }}
                />
              </div>
              {useExpireDate && (
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="text-sm"
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <label htmlFor="active" className="text-sm font-medium">
                Noticia activa
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="show_in_carousel"
                checked={formData.show_in_carousel}
                onCheckedChange={(checked) => setFormData({ ...formData, show_in_carousel: checked })}
              />
              <label htmlFor="show_in_carousel" className="text-sm font-medium">
                Mostrar en carrusel de inicio
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="comments_locked"
                checked={formData.comments_locked}
                onCheckedChange={(checked) => setFormData({ ...formData, comments_locked: checked })}
              />
              <label htmlFor="comments_locked" className="text-sm font-medium">
                Bloquear comentarios
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {news ? "Actualizar" : "Crear"} Noticia
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/noticias")} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
