"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, X, Loader2, Link } from "lucide-react"
import { availableIcons, SportIcon, isCustomIconUrl } from "@/lib/sport-icons"
import { cn } from "@/lib/utils"

interface IconPickerProps {
  value: string | null
  onChange: (icon: string) => void
  disabled?: boolean
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredIcons = availableIcons.filter(({ icon, label }) =>
    label.toLowerCase().includes(search.toLowerCase()) ||
    icon.toLowerCase().includes(search.toLowerCase())
  )

  const handleIconSelect = (icon: string) => {
    onChange(icon)
    setOpen(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen')
      return
    }

    // Validar tamaño (max 500KB)
    if (file.size > 500 * 1024) {
      alert('La imagen debe ser menor a 500KB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'icons')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al subir imagen')
      }

      const data = await response.json()
      onChange(data.url)
      setOpen(false)
    } catch (error) {
      console.error('Error uploading icon:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveCustomIcon = () => {
    onChange('sports_soccer')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-3 h-14 bg-transparent"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <SportIcon icon={value} size={24} className="text-primary" />
          </div>
          <div className="text-left flex-1">
            <div className="text-sm font-medium">
              {isCustomIconUrl(value) ? 'Icono personalizado' : (value || 'sports_soccer')}
            </div>
            <div className="text-xs text-muted-foreground">Click para cambiar</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Icono</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="material" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="material">Iconos Deportes</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="custom">Subir Imagen</TabsTrigger>
          </TabsList>

          <TabsContent value="material" className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar icono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Grid de iconos */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[400px] overflow-y-auto p-1">
              {filteredIcons.map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all hover:bg-accent",
                    value === icon && "bg-primary/10 border-primary ring-2 ring-primary/20"
                  )}
                >
                  <SportIcon icon={icon} size={28} className="text-foreground" />
                  <span className="text-[10px] text-muted-foreground text-center truncate w-full">
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron iconos
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                {customUrl && isCustomIconUrl(customUrl) ? (
                  <img src={customUrl} alt="Preview" className="w-12 h-12 object-contain" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <Link className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <Label className="text-sm text-muted-foreground">
                  Pega la URL de una imagen (PNG, SVG, WebP)
                </Label>
                <Input
                  placeholder="https://ejemplo.com/icono.png"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (customUrl.trim()) {
                    onChange(customUrl.trim())
                    setOpen(false)
                    setCustomUrl("")
                  }
                }}
                disabled={!customUrl.trim()}
              >
                Aplicar URL
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                {isCustomIconUrl(value) ? (
                  <img src={value! || "/placeholder.svg"} alt="Custom icon" className="w-12 h-12 object-contain" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Sube una imagen PNG o SVG (max 500KB)
                </Label>
              </div>

              <div className="flex gap-2 justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar archivo
                    </>
                  )}
                </Button>

                {isCustomIconUrl(value) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveCustomIcon}
                    className="bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>

              {isCustomIconUrl(value) && (
                <p className="text-xs text-green-500">
                  Icono personalizado cargado correctamente
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
