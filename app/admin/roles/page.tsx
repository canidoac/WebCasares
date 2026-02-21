import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { RolesManager } from "@/components/admin/roles-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from 'lucide-react'
import Link from "next/link"

export default async function RolesPage() {
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Gestión de Roles</h1>
            </div>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel de Administración
              </Button>
            </Link>
          </div>
          <RolesManager />
        </div>
      </main>
    </div>
  )
}
