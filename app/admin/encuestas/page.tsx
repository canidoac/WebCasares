import { getUserWithPermissions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { getNavbarItems } from '@/lib/site-config'
import { getAllSurveys } from './actions'
import { SurveysManager } from '@/components/admin/surveys-manager'

export const dynamic = 'force-dynamic'

export default async function EncuestasAdminPage() {
  const user = await getUserWithPermissions()

  if (!user || !user.permissions?.manage_surveys) {
    redirect('/admin')
  }

  const [surveys, navbarItems] = await Promise.all([
    getAllSurveys(),
    getNavbarItems(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <SurveysManager surveys={surveys} />
      </main>
    </div>
  )
}
