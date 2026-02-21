"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from 'lucide-react'
import { 
  getDisciplineImages, 
  addDisciplineImage, 
  deleteDisciplineImage 
} from "@/app/admin/disciplinas/actions"
import { useRouter } from 'next/navigation'

interface DisciplineImage {
  id: number
  image_url: string
  caption: string | null
  display_order: number
}

interface DisciplineImagesTabProps {
  disciplineId: number
}

export function DisciplineImagesTab({ disciplineId }: DisciplineImagesTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<DisciplineImage[]>([])
  const [newImage, setNewImage] = useState({ image_url: '', caption: '' })

  useEffect(() => {
    loadImages()
  }, [disciplineId])

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await getDisciplineImages(disciplineId)
      setImages(data)
    } catch (error) {
      console.error('[v0] Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImage.image_url.trim()) {
      alert('La URL de la imagen es requerida')
      return
    }

    try {
      await addDisciplineImage(disciplineId, {
        image_url: newImage.image_url,
        caption: newImage.caption || null
      })
      setNewImage({ image_url: '', caption: '' })
      await loadImages()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error adding image:', error)
      alert('Error al agregar imagen')
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

    try {
      await deleteDisciplineImage(imageId)
      await loadImages()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting image:', error)
      alert('Error al eliminar imagen')
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Galería de Imágenes</h2>
        <p className="text-muted-foreground">Gestiona las imágenes de la disciplina</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Imagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL de la Imagen *</Label>
            <Input
              placeholder="https://ejemplo.com/imagen.jpg"
              value={newImage.image_url}
              onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              O sube a: club-carlos-casares/disciplines/gallery/
            </p>
          </div>
          <div className="space-y-2">
            <Label>Caption (opcional)</Label>
            <Input
              placeholder="Descripción de la imagen"
              value={newImage.caption}
              onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
            />
          </div>
          <Button onClick={handleAddImage}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Imagen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image_url || "/placeholder.svg"}
                  alt={image.caption || ''}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm rounded-b-lg">
                    {image.caption}
                  </div>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No hay imágenes en esta disciplina
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
