'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, Users, Calendar, BarChart3 } from 'lucide-react'
import { Survey } from '@/app/admin/encuestas/actions'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface SurveyResultsProps {
  survey: Survey
  responses: any[]
}

export function SurveyResults({ survey, responses }: SurveyResultsProps) {
  const router = useRouter()
  const [selectedView, setSelectedView] = useState<'table' | 'stats'>('stats')

  const exportToCSV = () => {
    const headers = ['Fecha', 'Usuario', ...survey.questions.map(q => q.label)]
    const rows = responses.map(response => {
      const row = [
        new Date(response.submitted_at).toLocaleString(),
        response.User ? `${response.User.Nombre} ${response.User.Apellido}` : 'Anónimo',
      ]
      
      survey.questions.forEach(question => {
        const answer = response.responses.find((r: any) => r.question_id === question.id)
        if (answer) {
          if (Array.isArray(answer.value)) {
            row.push(answer.value.join(', '))
          } else {
            row.push(answer.value?.toString() || '')
          }
        } else {
          row.push('')
        }
      })
      
      return row
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `encuesta_${survey.title.replace(/\s+/g, '_')}_${Date.now()}.csv`
    link.click()
  }

  const getQuestionStats = (questionId: string) => {
    const question = survey.questions.find(q => q.id === questionId)
    if (!question) return null

    const answers = responses.map(r => 
      r.responses.find((ans: any) => ans.question_id === questionId)?.value
    ).filter(Boolean)

    if (question.type === 'single_choice') {
      const counts: Record<string, number> = {}
      answers.forEach(answer => {
        counts[answer] = (counts[answer] || 0) + 1
      })
      return { type: 'choice', data: counts, total: answers.length }
    }

    if (question.type === 'multiple_choice') {
      const counts: Record<string, number> = {}
      answers.forEach(answer => {
        if (Array.isArray(answer)) {
          answer.forEach(option => {
            counts[option] = (counts[option] || 0) + 1
          })
        }
      })
      return { type: 'multiple', data: counts, total: responses.length }
    }

    if (question.type === 'number') {
      const numbers = answers.map(a => parseFloat(a)).filter(n => !isNaN(n))
      if (numbers.length === 0) return null
      const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length
      const min = Math.min(...numbers)
      const max = Math.max(...numbers)
      return { type: 'number', avg, min, max, count: numbers.length }
    }

    return { type: 'text', count: answers.length }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/encuestas')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{survey.title}</h1>
            {survey.description && (
              <p className="text-muted-foreground mt-1">{survey.description}</p>
            )}
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Respuestas</p>
              <p className="text-2xl font-bold">{responses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Preguntas</p>
              <p className="text-2xl font-bold">{survey.questions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Última Respuesta</p>
              <p className="text-sm font-semibold">
                {responses.length > 0
                  ? new Date(responses[0].submitted_at).toLocaleDateString()
                  : 'Sin respuestas'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="table">Respuestas Individuales</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          {survey.questions.map((question) => {
            const stats = getQuestionStats(question.id)
            if (!stats) return null

            return (
              <Card key={question.id} className="p-6">
                <h3 className="text-lg font-semibold mb-4">{question.label}</h3>

                {stats.type === 'choice' && (
                  <div className="space-y-2">
                    {Object.entries(stats.data).map(([option, count]) => {
                      const percentage = ((count / stats.total) * 100).toFixed(1)
                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{option}</span>
                            <span className="text-muted-foreground">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {stats.type === 'multiple' && (
                  <div className="space-y-2">
                    {Object.entries(stats.data).map(([option, count]) => {
                      const percentage = ((count / stats.total) * 100).toFixed(1)
                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{option}</span>
                            <span className="text-muted-foreground">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {stats.type === 'number' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Promedio</p>
                      <p className="text-2xl font-bold">{stats.avg.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mínimo</p>
                      <p className="text-2xl font-bold">{stats.min}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Máximo</p>
                      <p className="text-2xl font-bold">{stats.max}</p>
                    </div>
                  </div>
                )}

                {stats.type === 'text' && (
                  <p className="text-muted-foreground">
                    {stats.count} respuesta{stats.count !== 1 ? 's' : ''} recibida{stats.count !== 1 ? 's' : ''}
                  </p>
                )}
              </Card>
            )
          })}

          {responses.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No hay respuestas aún. Las estadísticas aparecerán cuando alguien responda la encuesta.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="table">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    {survey.questions.map((q) => (
                      <TableHead key={q.id}>{q.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(response.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {response.User
                          ? `${response.User.Nombre} ${response.User.Apellido}`
                          : 'Anónimo'}
                      </TableCell>
                      {survey.questions.map((question) => {
                        const answer = response.responses.find(
                          (r: any) => r.question_id === question.id
                        )
                        return (
                          <TableCell key={question.id}>
                            {answer ? (
                              Array.isArray(answer.value) ? (
                                answer.value.join(', ')
                              ) : question.type === 'image' ? (
                                <a
                                  href={answer.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Ver imagen
                                </a>
                              ) : (
                                answer.value?.toString()
                              )
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {responses.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  No hay respuestas aún para esta encuesta.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
