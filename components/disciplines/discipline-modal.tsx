"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Image from "next/image"

interface DisciplineImage {
  id: number
  image_url: string
  caption: string | null
  display_order: number
}

interface DisciplineStaff {
  id: number
  role: string
  name: string
  display_order: number
}

interface Discipline {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  foundation_year: number | null
  current_tournament: string | null
  player_count: number
  images: DisciplineImage[]
  staff: DisciplineStaff[]
}

interface DisciplineModalProps {
  discipline: Discipline
  open: boolean
  onClose: () => void
}

export function DisciplineModal({ discipline, open, onClose }: DisciplineModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const sortedImages = [...(discipline.images || [])].sort((a, b) => a.display_order - b.display_order)
  const sortedStaff = [...(discipline.staff || [])].sort((a, b) => a.display_order - b.display_order)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary">
            {discipline.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {discipline.description && (
            <p className="text-muted-foreground leading-relaxed">
              {discipline.description}
            </p>
          )}

          {/* Image Carousel */}
          {sortedImages.length > 0 && (
            <div className="relative">
              <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={sortedImages[currentImageIndex]?.image_url || "/placeholder.svg"}
                  alt={sortedImages[currentImageIndex]?.caption || discipline.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {sortedImages.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-primary w-6'
                            : 'bg-background/60'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {discipline.foundation_year && (
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Año de Fundación</p>
                    <p className="text-2xl font-bold">{discipline.foundation_year}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {discipline.current_tournament && (
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Torneo Actual</p>
                    <p className="text-sm font-semibold">{discipline.current_tournament}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {discipline.player_count > 0 && (
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Jugadores</p>
                    <p className="text-2xl font-bold">{discipline.player_count} federados</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Staff/Cuerpo Técnico */}
          {sortedStaff.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Cuerpo Técnico
                </h3>
                <div className="space-y-3">
                  {sortedStaff.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="font-medium text-sm">{member.role}:</span>
                      <span className="text-muted-foreground">{member.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
