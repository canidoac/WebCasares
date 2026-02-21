import { notFound, redirect } from 'next/navigation'
import {
  getSurvey,
  checkUserHasResponded,
} from '@/app/admin/encuestas/actions'
import { SurveyForm as PublicSurveyForm } from '@/components/surveys/survey-form'
import { getUser } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EncuestaPage({
  params,
}: {
  params: { id: string }
}) {
  const surveyId = parseInt(params.id)
  if (isNaN(surveyId)) {
    notFound()
  }

  const survey = await getSurvey(surveyId)
  if (!survey || !survey.is_active) {
    notFound()
  }

  // Verificar fechas
  const now = new Date()
  if (survey.start_date && new Date(survey.start_date) > now) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Encuesta no disponible</h2>
          <p className="text-muted-foreground mb-6">
            Esta encuesta comenzará el{' '}
            {new Date(survey.start_date).toLocaleDateString()}
          </p>
          <Link href="/encuestas">
            <Button>Volver a encuestas</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (survey.end_date && new Date(survey.end_date) < now) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Encuesta finalizada</h2>
          <p className="text-muted-foreground mb-6">
            Esta encuesta finalizó el{' '}
            {new Date(survey.end_date).toLocaleDateString()}
          </p>
          <Link href="/encuestas">
            <Button>Volver a encuestas</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Verificar login si es requerido
  const user = await getUser()
  if (survey.requires_login && !user) {
    redirect('/login?redirect=/encuestas/' + surveyId)
  }

  // Verificar si ya respondió
  const hasResponded = await checkUserHasResponded(surveyId)
  if (hasResponded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Gracias por participar</h2>
          <p className="text-muted-foreground mb-6">
            Ya has respondido esta encuesta.
          </p>
          <Link href="/encuestas">
            <Button>Volver a encuestas</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <PublicSurveyForm survey={survey} />
      </div>
    </div>
  )
}
