import { isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { TournamentsManager } from "@/components/admin/tournaments-manager"

export default async function TorneosPage() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    redirect("/")
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Torneos</h1>
        <p className="text-muted-foreground mt-2">
          Administra los torneos de todas las disciplinas del club
        </p>
      </div>
      
      <TournamentsManager />
    </div>
  )
}
