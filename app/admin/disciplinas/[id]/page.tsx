import { getUser, isAdmin, canManageDiscipline } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { DisciplineEditor } from "@/components/admin/discipline-editor"

export const dynamic = 'force-dynamic'

export default async function EditDisciplinePage({ params }: { params: { id: string } }) {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  const disciplineId = parseInt(params.id)

  const canManage = await canManageDiscipline(disciplineId)
  if (!canManage) {
    redirect("/admin/disciplinas")
  }

  const navbarItems = await getNavbarItems()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1">
        <DisciplineEditor disciplineId={disciplineId} />
      </main>
    </div>
  )
}
