"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, EyeOff, Clock, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteNews } from "@/app/admin/noticias/actions"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface NewsItem {
  id: number
  title: string
  description: string
  image_url: string
  action_text?: string
  action_url?: string
  active: boolean
  display_order: number
  starts_at?: string
  expires_at?: string
  created_at: string
}

interface NewsListProps {
  news: NewsItem[]
}

export function NewsList({ news }: NewsListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await deleteNews(deleteId)
      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting news:", error)
    } finally {
      setDeleting(false)
    }
  }

  const getNewsStatus = (item: NewsItem) => {
    const now = new Date()
    const startDate = item.starts_at ? new Date(item.starts_at) : null
    const expirationDate = item.expires_at ? new Date(item.expires_at) : null

    if (expirationDate && expirationDate < now) {
      return { status: "expired", label: "Expirada", variant: "destructive" as const }
    }

    if (startDate && startDate > now) {
      return { status: "scheduled", label: "Programada", variant: "secondary" as const }
    }

    if (item.active) {
      return { status: "active", label: "Activa", variant: "default" as const }
    }

    return { status: "inactive", label: "Inactiva", variant: "secondary" as const }
  }

  if (news.length === 0) {
    return (
      <Card>
        <div className="p-4 text-center text-muted-foreground">
          No hay noticias creadas. Crea tu primera noticia usando el botón de arriba.
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {news.map((item) => {
          const newsStatus = getNewsStatus(item)

          return (
            <Card key={item.id} className="p-3 hover:bg-muted/50 transition-colors">
              <div className="flex gap-3 items-center">
                {/* Miniatura */}
                <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                  <Image src={item.image_url || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant={newsStatus.variant} className="text-xs">
                        {newsStatus.status === "active" && <Eye className="h-3 w-3 mr-1" />}
                        {newsStatus.status === "inactive" && <EyeOff className="h-3 w-3 mr-1" />}
                        {newsStatus.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        #{item.display_order}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.description}</p>

                  {(item.starts_at || item.expires_at) && (
                    <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                      {item.starts_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.starts_at).toLocaleDateString("es-AR")}
                        </span>
                      )}
                      {item.expires_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.expires_at).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/admin/noticias/${item.id}`)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(item.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La noticia será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
