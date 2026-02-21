'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Survey, submitSurveyResponse } from '@/app/admin/encuestas/actions'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { put } from '@vercel/blob'

interface SurveyFormProps {
  survey: Survey
}

export function SurveyForm({ survey }: SurveyFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadingImages({ ...uploadingImages, [questionId]: true })
    
    try {
      const blob = await put(
        `club-carlos-casares/surveys/${survey.id}/${Date.now()}-${file.name}`,
        file,
        { access: 'public' }
      )
      
      setResponses({ ...responses, [questionId]: blob.url })
      toast({
        title: 'Imagen cargada',
        description: 'La imagen se ha subido correctamente',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      })
    } finally {
      setUploadingImages({ ...uploadingImages, [questionId]: false })
    }
  }

  const validateEmail = (email: string) => {
    return email.includes('@')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      for (const question of survey.questions) {
        if (question.required && !responses[question.id]) {
          throw new Error(`La pregunta "${question.label}" es requerida`)
        }

        // Validar email
        if (
          question.type === 'email' &&
          responses[question.id] &&
          !validateEmail(responses[question.id])
        ) {
          throw new Error(`Ingresa un email válido en "${question.label}"`)
        }
      }

      const formattedResponses = Object.entries(responses).map(
        ([question_id, value]) => ({
          question_id,
          value,
        })
      )

      await submitSurveyResponse(survey.id, formattedResponses)

      toast({
        title: '¡Gracias por participar!',
        description: 'Tu respuesta ha sido enviada exitosamente',
      })

      router.push('/encuestas')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar la respuesta',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
        {survey.description && (
          <p className="text-muted-foreground">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {survey.questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <Label className="text-lg">
              {index + 1}. {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {question.type === 'text' && (
              <Textarea
                value={responses[question.id] || ''}
                onChange={(e) =>
                  setResponses({ ...responses, [question.id]: e.target.value })
                }
                required={question.required}
                rows={4}
              />
            )}

            {question.type === 'number' && (
              <Input
                type="number"
                value={responses[question.id] || ''}
                onChange={(e) =>
                  setResponses({ ...responses, [question.id]: e.target.value })
                }
                required={question.required}
              />
            )}

            {question.type === 'email' && (
              <Input
                type="email"
                value={responses[question.id] || ''}
                onChange={(e) =>
                  setResponses({ ...responses, [question.id]: e.target.value })
                }
                required={question.required}
                placeholder="ejemplo@email.com"
              />
            )}

            {question.type === 'date' && (
              <Input
                type="date"
                value={responses[question.id] || ''}
                onChange={(e) =>
                  setResponses({ ...responses, [question.id]: e.target.value })
                }
                required={question.required}
              />
            )}

            {question.type === 'image' && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(question.id, file)
                  }}
                  disabled={uploadingImages[question.id]}
                />
                {uploadingImages[question.id] && (
                  <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                )}
                {responses[question.id] && (
                  <div className="mt-2">
                    <img
                      src={responses[question.id] || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-xs rounded border"
                    />
                  </div>
                )}
              </div>
            )}

            {question.type === 'single_choice' && (
              <RadioGroup
                value={responses[question.id] || ''}
                onValueChange={(value) =>
                  setResponses({ ...responses, [question.id]: value })
                }
                required={question.required}
              >
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                    <Label htmlFor={`${question.id}-${optIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-${optIndex}`}
                      checked={
                        responses[question.id]?.includes(option) || false
                      }
                      onCheckedChange={(checked) => {
                        const current = responses[question.id] || []
                        const newValue = checked
                          ? [...current, option]
                          : current.filter((v: string) => v !== option)
                        setResponses({ ...responses, [question.id]: newValue })
                      }}
                    />
                    <Label htmlFor={`${question.id}-${optIndex}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/encuestas')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
