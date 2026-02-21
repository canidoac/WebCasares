import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { ClubInfoManager } from "@/components/admin/club-info-manager"
import { BoardMembersManager } from "@/components/admin/board-members-manager"
import { Users, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminClubPage() {
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
          <h1 className="text-3xl font-bold mb-8">Gestión del Club</h1>

          <div className="space-y-8">
            {/* Club Info Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Información del Club</h2>
              </div>
              <ClubInfoManager />
            </div>

            {/* Board Members Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Comisión Directiva</h2>
              </div>
              <BoardMembersManager />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
