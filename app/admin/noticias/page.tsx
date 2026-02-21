import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Newspaper, Plus } from 'lucide-react'
import Link from "next/link"
import { getNews } from "./actions"
import { NewsList } from "@/components/admin/news-list"

export default async function AdminNoticiasPage() {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  const news = await getNews()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Gestión de Noticias</h1>
                <p className="text-muted-foreground">Administra las noticias del carrusel principal</p>
              </div>
            </div>
            <Link href="/admin/noticias/nueva">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Noticia
              </Button>
            </Link>
          </div>

          <NewsList news={news} />

          <div className="mt-6">
            <Link href="/admin">
              <Button variant="outline">Volver al Panel</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
