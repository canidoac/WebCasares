import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { NewsForm } from "@/components/admin/news-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createDefaultNews } from "../actions"

export default async function NuevaNoticiaPage() {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  // Crear noticia con valores por defecto
  const newNews = await createDefaultNews()

  // Redirigir a la página de edición de la nueva noticia
  redirect(`/admin/noticias/${newNews.id}`)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin/noticias">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Noticias
            </Button>
          </Link>
          <NewsForm />
        </div>
      </main>
    </div>
  )
}
