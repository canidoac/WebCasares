import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getActiveSurveys() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('Surveys')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function EncuestasPage() {
  const surveys = await getActiveSurveys()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Encuestas</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{survey.title}</h2>
                  {survey.description && (
                    <p className="text-muted-foreground">{survey.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {survey.questions.length} pregunta{survey.questions.length !== 1 ? 's' : ''}
                  </div>
                  {survey.requires_login && (
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      Requiere login
                    </div>
                  )}
                </div>

                {survey.end_date && (
                  <p className="text-sm text-muted-foreground">
                    Finaliza: {new Date(survey.end_date).toLocaleDateString()}
                  </p>
                )}

                <Link href={`/encuestas/${survey.id}`}>
                  <Button className="w-full">Responder Encuesta</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {surveys.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No hay encuestas activas en este momento.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
