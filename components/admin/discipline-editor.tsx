"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Info, Users, UserCog, Image, Calendar, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getDisciplineById } from "@/app/admin/disciplinas/actions"
import { DisciplineInfoTab } from "./discipline-tabs/info-tab"
import { DisciplinePlayersTab } from "./discipline-tabs/players-tab"
import { DisciplineStaffTab } from "./discipline-tabs/staff-tab"
import { DisciplineImagesTab } from "./discipline-tabs/images-tab"
import { DisciplineMatchesTab } from "./discipline-tabs/matches-tab"
import { DisciplineResultsTab } from "./discipline-tabs/results-tab"

interface Discipline {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  foundation_year: number | null
  current_tournament: string | null
  player_count: number
  is_active: boolean
  display_order: number
}

interface DisciplineEditorProps {
  disciplineId: number
}

type TabType = 'info' | 'players' | 'staff' | 'images' | 'matches' | 'results'

export function DisciplineEditor({ disciplineId }: DisciplineEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [discipline, setDiscipline] = useState<Discipline | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('info')

  useEffect(() => {
    loadDiscipline()
  }, [disciplineId])

  const loadDiscipline = async () => {
    setLoading(true)
    try {
      const data = await getDisciplineById(disciplineId)
      setDiscipline(data)
    } catch (error) {
      console.error('[v0] Error loading discipline:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Cargando...</div>
  }

  if (!discipline) {
    return <div className="container mx-auto p-6">Disciplina no encontrada</div>
  }

  const tabs = [
    { id: 'info' as TabType, label: 'Información General', icon: Info },
    { id: 'players' as TabType, label: 'Jugadores', icon: Users, badge: discipline.player_count },
    { id: 'staff' as TabType, label: 'Cuerpo Técnico', icon: UserCog },
    { id: 'images' as TabType, label: 'Imágenes', icon: Image },
    { id: 'matches' as TabType, label: 'Próximas Fechas', icon: Calendar },
    { id: 'results' as TabType, label: 'Resultados', icon: Trophy },
  ]

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start mb-4"
          onClick={() => router.push('/admin/disciplinas')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div className="mb-4 pb-4 border-b">
          <h2 className="font-bold text-lg">{discipline.name}</h2>
          <span className={`text-xs px-2 py-1 rounded inline-block mt-2 ${discipline.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
            {discipline.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {tab.badge}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-5xl">
          {activeTab === 'info' && (
            <DisciplineInfoTab discipline={discipline} onUpdate={loadDiscipline} />
          )}
          {activeTab === 'players' && (
            <DisciplinePlayersTab disciplineId={disciplineId} onUpdate={loadDiscipline} />
          )}
          {activeTab === 'staff' && (
            <DisciplineStaffTab disciplineId={disciplineId} />
          )}
          {activeTab === 'images' && (
            <DisciplineImagesTab disciplineId={disciplineId} />
          )}
          {activeTab === 'matches' && (
            <DisciplineMatchesTab disciplineId={disciplineId} />
          )}
          {activeTab === 'results' && (
            <DisciplineResultsTab disciplineId={disciplineId} />
          )}
        </div>
      </div>
    </div>
  )
}
