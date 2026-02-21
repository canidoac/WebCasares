"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

interface SitePage {
  id: number
  name: string
  path: string
  description: string
  category: string
  is_active: boolean
}

interface SitePageSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (path: string) => void
  currentPath?: string
}

export function SitePageSelector({ open, onOpenChange, onSelect, currentPath }: SitePageSelectorProps) {
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Principal']))

  useEffect(() => {
    if (open) {
      loadPages()
    }
  }, [open])

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/site-pages')
      const data = await response.json()
      setPages(data.pages || [])
    } catch (error) {
      console.error('[v0] Error loading site pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedPages = filteredPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = []
    }
    acc[page.category].push(page)
    return acc
  }, {} as Record<string, SitePage[]>)

  const handleSelect = (path: string) => {
    onSelect(path)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Seleccionar Página del Sitio</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Elige una página existente del sitio para el ítem de navegación
          </p>
        </DialogHeader>

        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, ruta o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando páginas...</div>
          ) : Object.keys(groupedPages).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery ? 'No se encontraron páginas' : 'No hay páginas disponibles'}
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {Object.entries(groupedPages).map(([category, categoryPages]) => (
                <div key={category} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-semibold text-sm">{category}</span>
                      <span className="text-xs text-muted-foreground">
                        ({categoryPages.length})
                      </span>
                    </div>
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="divide-y">
                      {categoryPages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => handleSelect(page.path)}
                          className="w-full p-3 hover:bg-muted/20 transition-colors text-left group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{page.name}</span>
                                {currentPath === page.path && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    Actual
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                {page.path}
                              </div>
                              {page.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {page.description}
                                </div>
                              )}
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
