import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { DisciplinesManager } from "@/components/admin/disciplines-manager"
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDisciplinasPage() {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  const navbarItems = await getNavbarItems()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestión de Disciplinas</h1>
          </div>
          <DisciplinesManager />
        </div>
      </main>
    </div>
  )
}
