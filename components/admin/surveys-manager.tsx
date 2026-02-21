'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Pencil, Trash2, BarChart3 } from 'lucide-react'
import { Survey, deleteSurvey } from '@/app/admin/encuestas/actions'
import { SurveyForm } from './survey-form'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface SurveysManagerProps {
  surveys: Survey[]
}

export function SurveysManager({ surveys }: SurveysManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta encuesta? Se eliminarán también todas las respuestas.')) {
      return
    }

    try {
      await deleteSurvey(id)
      toast({
        title: 'Encuesta eliminada',
        description: 'La encuesta ha sido eliminada exitosamente',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la encuesta',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (survey: Survey) => {
    setEditingSurvey(survey)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingSurvey(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Encuestas</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Encuesta
        </Button>
      </div>

      {isFormOpen && (
        <SurveyForm
          survey={editingSurvey}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm()
            router.refresh()
          }}
        />
      )}

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <Card key={survey.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{survey.title}</h3>
                  {survey.is_active ? (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-500 rounded">
                      Inactiva
                    </span>
                  )}
                  {survey.requires_login && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-500 rounded">
                      Requiere Login
                    </span>
                  )}
                </div>
                {survey.description && (
                  <p className="text-muted-foreground mb-3">{survey.description}</p>
                )}
                <div className="text-sm text-muted-foreground">
                  {survey.questions.length} pregunta{survey.questions.length !== 1 ? 's' : ''}
                  {survey.start_date && ` • Inicia: ${new Date(survey.start_date).toLocaleDateString()}`}
                  {survey.end_date && ` • Finaliza: ${new Date(survey.end_date).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/admin/encuestas/${survey.id}/resultados`)}
                  title="Ver resultados"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(survey)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(survey.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {surveys.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No hay encuestas creadas. Crea tu primera encuesta para comenzar.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
