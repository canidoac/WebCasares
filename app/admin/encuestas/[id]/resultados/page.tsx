import { getSurvey, getSurveyResponses } from '@/app/admin/encuestas/actions'
import { SurveyResults } from '@/components/admin/survey-results'
import { notFound } from 'next/navigation'
import { getUserWithPermissions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { getNavbarItems } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResultadosPage({ params }: PageProps) {
  const user = await getUserWithPermissions()

  if (!user || !user.permissions?.manage_surveys) {
    redirect('/admin')
  }

  const { id } = await params
  const surveyId = parseInt(id)

  if (isNaN(surveyId)) {
    notFound()
  }

  try {
    const [survey, responses, navbarItems] = await Promise.all([
      getSurvey(surveyId),
      getSurveyResponses(surveyId),
      getNavbarItems(),
    ])

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar user={user} navbarItems={navbarItems} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <SurveyResults survey={survey} responses={responses} />
        </main>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
