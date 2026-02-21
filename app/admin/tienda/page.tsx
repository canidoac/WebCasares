import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { ProductsManager } from "@/components/admin/products-manager"
import { getProducts } from "./actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function TiendaAdminPage() {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  const navbarItems = await getNavbarItems()
  const products = await getProducts()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel de Administración
            </Button>
          </Link>
        </div>
        <ProductsManager initialProducts={products} />
      </main>
    </div>
  )
}
