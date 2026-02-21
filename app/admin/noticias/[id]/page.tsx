import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { NewsForm } from "@/components/admin/news-form"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getDisciplines } from "../actions"

export default async function EditarNoticiaPage({ params }: { params: { id: string } }) {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  if (params.id === "nueva") {
    redirect("/admin/noticias/nueva")
  }

  const newsId = Number.parseInt(params.id)
  if (isNaN(newsId)) {
    redirect("/admin/noticias")
  }

  const supabase = await createClient()
  const { data: news } = await supabase.from("News").select("*").eq("id", newsId).single()

  if (!news) {
    redirect("/admin/noticias")
  }

  const disciplines = await getDisciplines()
  
  const { data: newsDisciplines } = await supabase
    .from('NewsDisciplines')
    .select('discipline_id, discipline:Disciplines(id, name)')
    .eq('news_id', newsId)

  const newsWithDisciplines = {
    ...news,
    disciplines: newsDisciplines?.map((nd: any) => nd.discipline).filter(Boolean) || []
  }

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
          <NewsForm news={newsWithDisciplines} disciplines={disciplines} />
        </div>
      </main>
    </div>
  )
}
