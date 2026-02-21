'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Package, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProduct, updateProduct, deleteProduct, toggleProductStock } from "@/app/admin/tienda/actions"
import { toast } from "@/hooks/use-toast"
import { MediaUploader } from "./media-uploader"

interface Product {
  id: string
  name: string
  price: number
  image_front: string
  image_back: string | null
  badge: string | null
  description: string
  in_stock: boolean
  is_3d: boolean
  render_3d_url: string | null
  category: string | null
  variants: any
  created_at: string
  updated_at: string
}

interface ProductsManagerProps {
  initialProducts: Product[]
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    image_front: "",
    image_back: "",
    badge: "",
    description: "",
    in_stock: true,
    is_3d: false,
    render_3d_url: "",
    category: "",
  })

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      price: "",
      image_front: "",
      image_back: "",
      badge: "",
      description: "",
      in_stock: true,
      is_3d: false,
      render_3d_url: "",
      category: "",
    })
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      image_front: product.image_front,
      image_back: product.image_back || "",
      badge: product.badge || "",
      description: product.description,
      in_stock: product.in_stock,
      is_3d: product.is_3d,
      render_3d_url: product.render_3d_url || "",
      category: product.category || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.image_front || !formData.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString())
      })

      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente",
        })
      } else {
        await createProduct(data)
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return

    setIsLoading(true)
    try {
      await deleteProduct(id)
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStock = async (id: string) => {
    setIsLoading(true)
    try {
      await toggleProductStock(id)
      toast({
        title: "Stock actualizado",
        description: "El estado del stock se ha actualizado correctamente",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tienda</h1>
          <p className="text-muted-foreground">Administra los productos de la tienda oficial</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modifica los datos del producto" : "Completa los datos del nuevo producto"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!editingProduct && (
                <div className="space-y-2">
                  <Label htmlFor="id">ID del Producto *</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="ej: camiseta-titular-2025"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="22000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camisetas">Camisetas</SelectItem>
                      <SelectItem value="accesorios">Accesorios</SelectItem>
                      <SelectItem value="indumentaria">Indumentaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Etiqueta (opcional)</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="ej: Nueva, Edición Especial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen Frontal *</Label>
                <MediaUploader
                  value={formData.image_front}
                  onChange={(url) => setFormData({ ...formData, image_front: url })}
                  folder="club-carlos-casares/store/products"
                  accept="image/*"
                />
                {formData.image_front && (
                  <img src={formData.image_front || "/placeholder.svg"} alt="Preview" className="w-32 h-32 object-cover rounded" />
                )}
              </div>

              <div className="space-y-2">
                <Label>Imagen Posterior (opcional)</Label>
                <MediaUploader
                  value={formData.image_back}
                  onChange={(url) => setFormData({ ...formData, image_back: url })}
                  folder="club-carlos-casares/store/products"
                  accept="image/*"
                />
                {formData.image_back && (
                  <img src={formData.image_back || "/placeholder.svg"} alt="Preview" className="w-32 h-32 object-cover rounded" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="in_stock">En Stock</Label>
                <Switch
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_3d">Tiene Render 3D</Label>
                <Switch
                  id="is_3d"
                  checked={formData.is_3d}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_3d: checked })}
                />
              </div>

              {formData.is_3d && (
                <div className="space-y-2">
                  <Label htmlFor="render_3d_url">URL Render 3D</Label>
                  <Input
                    id="render_3d_url"
                    value={formData.render_3d_url}
                    onChange={(e) => setFormData({ ...formData, render_3d_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                  {isLoading ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>${product.price.toLocaleString()}</CardDescription>
                </div>
                {product.badge && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {product.badge}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {product.image_front && (
                  <img
                    src={product.image_front || "/placeholder.svg"}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                {product.image_back && (
                  <img
                    src={product.image_back || "/placeholder.svg"}
                    alt={`${product.name} - Atrás`}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <Package className={`h-4 w-4 ${product.in_stock ? "text-green-500" : "text-red-500"}`} />
                <span className={product.in_stock ? "text-green-500" : "text-red-500"}>
                  {product.in_stock ? "En Stock" : "Sin Stock"}
                </span>
              </div>

              {product.category && (
                <div className="text-xs text-muted-foreground">
                  Categoría: {product.category}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStock(product.id)}
                  disabled={isLoading}
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay productos en la tienda</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
