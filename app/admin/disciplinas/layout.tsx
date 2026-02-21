"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ListChecks as ListCheck, MapPin, Trophy } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export default function DisciplinasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const isMain = pathname === '/admin/disciplinas'
  const isTournaments = pathname === '/admin/disciplinas/torneos'
  const isLocations = pathname === '/admin/disciplinas/ubicaciones'
  const isEditingDiscipline = pathname.includes('/admin/disciplinas/') && !isTournaments && !isLocations && pathname !== '/admin/disciplinas'

  if (isEditingDiscipline) {
    return <>{children}</>
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start mb-4"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Panel Admin
        </Button>
        
        <div className="space-y-1">
          <Button
            variant={isMain ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => router.push('/admin/disciplinas')}
          >
            <ListCheck className="h-4 w-4 mr-2" />
            Disciplinas
          </Button>

          <Button
            variant={isTournaments ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => router.push('/admin/disciplinas/torneos')}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Torneos
          </Button>

          <Button
            variant={isLocations ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => router.push('/admin/disciplinas/ubicaciones')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Ubicaciones
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
