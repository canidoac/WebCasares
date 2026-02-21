"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from 'lucide-react'

interface Discipline {
  id: number
  name: string
  slug: string
}

interface RoleDiscipline {
  discipline_id: number
  can_manage_matches: boolean
  can_manage_results: boolean
}

interface RoleDisciplinesEditorProps {
  roleId?: number
  disciplines: Discipline[]
  selectedDisciplines: RoleDiscipline[]
  onChange: (disciplines: RoleDiscipline[]) => void
}

export function RoleDisciplinesEditor({
  roleId,
  disciplines,
  selectedDisciplines,
  onChange,
}: RoleDisciplinesEditorProps) {
  const [localDisciplines, setLocalDisciplines] = useState<RoleDiscipline[]>(selectedDisciplines)

  useEffect(() => {
    setLocalDisciplines(selectedDisciplines)
  }, [selectedDisciplines])

  const handleToggleDiscipline = (disciplineId: number, enabled: boolean) => {
    let updated: RoleDiscipline[]
    
    if (enabled) {
      // Agregar disciplina con permisos por defecto
      updated = [
        ...localDisciplines,
        {
          discipline_id: disciplineId,
          can_manage_matches: true,
          can_manage_results: true,
        },
      ]
    } else {
      // Remover disciplina
      updated = localDisciplines.filter((d) => d.discipline_id !== disciplineId)
    }
    
    setLocalDisciplines(updated)
    onChange(updated)
  }

  const handlePermissionChange = (
    disciplineId: number,
    permission: 'can_manage_matches' | 'can_manage_results',
    value: boolean
  ) => {
    const updated = localDisciplines.map((d) =>
      d.discipline_id === disciplineId ? { ...d, [permission]: value } : d
    )
    setLocalDisciplines(updated)
    onChange(updated)
  }

  const isDisciplineSelected = (disciplineId: number) =>
    localDisciplines.some((d) => d.discipline_id === disciplineId)

  const getDisciplinePermissions = (disciplineId: number) =>
    localDisciplines.find((d) => d.discipline_id === disciplineId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Disciplinas Asignadas</CardTitle>
        </div>
        <CardDescription>
          Selecciona las disciplinas que este rol puede gestionar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {disciplines.map((discipline) => {
          const isSelected = isDisciplineSelected(discipline.id)
          const permissions = getDisciplinePermissions(discipline.id)

          return (
            <div key={discipline.id} className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`discipline-${discipline.id}`} className="text-base font-semibold cursor-pointer">
                    {discipline.name}
                  </Label>
                  {isSelected && <Badge variant="secondary">Activo</Badge>}
                </div>
                <Switch
                  id={`discipline-${discipline.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleToggleDiscipline(discipline.id, checked)}
                />
              </div>

              {isSelected && permissions && (
                <div className="ml-4 space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`matches-${discipline.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Gestionar Partidos/Fechas
                    </Label>
                    <Switch
                      id={`matches-${discipline.id}`}
                      checked={permissions.can_manage_matches}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(discipline.id, 'can_manage_matches', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`results-${discipline.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Cargar Resultados
                    </Label>
                    <Switch
                      id={`results-${discipline.id}`}
                      checked={permissions.can_manage_results}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(discipline.id, 'can_manage_results', checked)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {localDisciplines.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay disciplinas asignadas. Activa los switches para asignar disciplinas a este rol.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
