import { isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { LocationsManager } from "@/components/admin/locations-manager"

export default async function UbicacionesPage() {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    redirect("/")
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Ubicaciones</h1>
        <p className="text-muted-foreground mt-2">
          Administra las ubicaciones/canchas donde se juegan los partidos
        </p>
      </div>
      
      <LocationsManager />
    </div>
  )
}
