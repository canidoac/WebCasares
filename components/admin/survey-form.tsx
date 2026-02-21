'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import {
  Survey,
  SurveyQuestion,
  QuestionType,
  createSurvey,
  updateSurvey,
} from '@/app/admin/encuestas/actions'
import { toast } from '@/hooks/use-toast'

interface SurveyFormProps {
  survey?: Survey | null
  onClose: () => void
  onSuccess: () => void
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Fecha' },
  { value: 'image', label: 'Imagen' },
  { value: 'single_choice', label: 'Opción Única' },
  { value: 'multiple_choice', label: 'Múltiple Selección' },
]

export function SurveyForm({ survey, onClose, onSuccess }: SurveyFormProps) {
  const [title, setTitle] = useState(survey?.title || '')
  const [description, setDescription] = useState(survey?.description || '')
  const [requiresLogin, setRequiresLogin] = useState(survey?.requires_login || false)
  const [isActive, setIsActive] = useState(survey?.is_active ?? true)
  const [startDate, setStartDate] = useState(survey?.start_date?.split('T')[0] || '')
  const [endDate, setEndDate] = useState(survey?.end_date?.split('T')[0] || '')
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    survey?.questions || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      required: false,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    )
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const options = question.options || []
    updateQuestion(questionId, { options: [...options, ''] })
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question || !question.options) return

    const newOptions = [...question.options]
    newOptions[index] = value
    updateQuestion(questionId, { options: newOptions })
  }

  const removeOption = (questionId: string, index: number) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question || !question.options) return

    const newOptions = question.options.filter((_, i) => i !== index)
    updateQuestion(questionId, { options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!title.trim()) {
        throw new Error('El título es requerido')
      }

      if (questions.length === 0) {
        throw new Error('Debes agregar al menos una pregunta')
      }

      for (const q of questions) {
        if (!q.label.trim()) {
          throw new Error('Todas las preguntas deben tener un texto')
        }
        if (
          (q.type === 'single_choice' || q.type === 'multiple_choice') &&
          (!q.options || q.options.length < 2)
        ) {
          throw new Error('Las preguntas de selección deben tener al menos 2 opciones')
        }
      }

      const data = {
        title,
        description: description || undefined,
        requires_login: requiresLogin,
        is_active: isActive,
        questions,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }

      if (survey) {
        await updateSurvey(survey.id, data)
        toast({
          title: 'Encuesta actualizada',
          description: 'La encuesta ha sido actualizada exitosamente',
        })
      } else {
        await createSurvey(data)
        toast({
          title: 'Encuesta creada',
          description: 'La encuesta ha sido creada exitosamente',
        })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la encuesta',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {survey ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </h3>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la encuesta"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional de la encuesta"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Fecha de Finalización</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requires_login">Requiere Inicio de Sesión</Label>
            <Switch
              id="requires_login"
              checked={requiresLogin}
              onCheckedChange={setRequiresLogin}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Encuesta Activa</Label>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Preguntas</Label>
            <Button type="button" onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Pregunta
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card key={question.id} className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Pregunta {index + 1} *</Label>
                      <Input
                        value={question.label}
                        onChange={(e) =>
                          updateQuestion(question.id, { label: e.target.value })
                        }
                        placeholder="Texto de la pregunta"
                        required
                      />
                    </div>
                    <div className="w-48">
                      <Label>Tipo</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value: QuestionType) =>
                          updateQuestion(question.id, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(question.type === 'single_choice' ||
                    question.type === 'multiple_choice') && (
                    <div className="space-y-2">
                      <Label>Opciones *</Label>
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(question.id, optIndex, e.target.value)
                            }
                            placeholder={`Opción ${optIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(question.id, optIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Agregar Opción
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) =>
                        updateQuestion(question.id, { required: checked })
                      }
                    />
                    <Label>Campo requerido</Label>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay preguntas. Agrega al menos una pregunta para continuar.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : survey ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
