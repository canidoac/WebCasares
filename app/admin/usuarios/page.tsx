import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { UsersManager } from "@/components/admin/users-manager"
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminUsuariosPage() {
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel de Administración
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          </div>
          <UsersManager />
        </div>
      </main>
    </div>
  )
}
