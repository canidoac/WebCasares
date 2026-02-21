"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SportIcon } from "@/lib/sport-icons"

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

interface DisciplinesGridProps {
  disciplines: Discipline[]
}

export function DisciplinesGrid({ disciplines }: DisciplinesGridProps) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)

  if (!disciplines || disciplines.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No hay disciplinas disponibles en este momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {disciplines.map((discipline) => (
          <a 
            key={discipline.id}
            href={`/disciplinas/${discipline.slug}`}
            className="block"
          >
            <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-4 min-h-[150px]">
                <div className="rounded-full bg-primary/10 p-4">
                  <SportIcon icon={discipline.icon} size={40} className="text-primary" />
                </div>
                <h3 className="font-semibold text-center text-sm md:text-base">
                  {discipline.name}
                </h3>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </>
  )
}
