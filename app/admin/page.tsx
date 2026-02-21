import { getUserWithPermissions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Shield, Newspaper, Settings, Users, Trophy, Award, Package, ClipboardList } from 'lucide-react'
import Link from "next/link"
import { getNavbarItems } from "@/lib/site-config"

export default async function AdminPage() {
  const user = await getUserWithPermissions()

  if (!user || !user.permissions?.panel_admin) {
    redirect("/")
  }

  const navbarItems = await getNavbarItems()

  const adminPanels = [
    {
      title: "Gestión de Noticias",
      subtitle: "Administra las noticias del carrusel",
      description: "Crea, edita y elimina noticias que aparecen en el carrusel principal del sitio.",
      href: "/admin/noticias",
      icon: Newspaper,
      permission: "manage_news_admin",
    },
    {
      title: "Gestión del Club",
      subtitle: "Administra info y comisión",
      description: "Edita la historia del club y la comisión directiva.",
      href: "/admin/club",
      icon: Users,
      permission: "manage_club",
    },
    {
      title: "Gestión de Disciplinas",
      subtitle: "Administra las disciplinas deportivas",
      description: "Crea, edita y elimina disciplinas deportivas del club.",
      href: "/admin/disciplinas",
      icon: Trophy,
      permission: "manage_disciplines",
    },
    {
      title: "Gestión de Encuestas",
      subtitle: "Administra encuestas y respuestas",
      description: "Crea encuestas, visualiza respuestas y exporta resultados en tiempo real.",
      href: "/admin/encuestas",
      icon: ClipboardList,
      permission: "manage_surveys",
    },
    {
      title: "Gestión de Usuarios",
      subtitle: "Administra los socios del club",
      description: "Ver lista de socios, cambiar roles y gestionar membresías.",
      href: "/admin/usuarios",
      icon: Users,
      permission: "manage_users_admin",
    },
    {
      title: "Configuración del Sitio",
      subtitle: "Personaliza la apariencia y contenido",
      description: "Configura header, popup, registro de usuarios y navegación.",
      href: "/admin/configuracion",
      icon: Settings,
      permission: "manage_site_config",
    },
    {
      title: "Gestión de Sponsors",
      subtitle: "Administra los patrocinadores",
      description: "Crea, edita y ordena los sponsors que aparecen en el sitio.",
      href: "/admin/sponsors",
      icon: Award,
      permission: "manage_sponsors",
    },
    {
      title: "Gestión de Roles",
      subtitle: "Administra roles y permisos",
      description: "Crea y edita roles con permisos personalizados del sistema.",
      href: "/admin/roles",
      icon: Shield,
      permission: "manage_roles_admin",
    },
    {
      title: "Gestión de Tienda",
      subtitle: "Administra productos y stock",
      description: "Crea, edita y gestiona productos, precios y disponibilidad.",
      href: "/admin/tienda",
      icon: Package,
      permission: "manage_store_admin",
    },
  ]

  const availablePanels = adminPanels.filter(panel => user.permissions?.[panel.permission] === true)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">
                {user.roleDisplayName} - {availablePanels.length} panel(es) disponible(s)
              </p>
            </div>
          </div>

          {availablePanels.length === 0 ? (
            <div className="bg-card border rounded-lg p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin acceso a paneles</h3>
              <p className="text-muted-foreground">
                Tu rol actual no tiene permisos para acceder a ningún panel de administración.
                Contacta con un administrador para obtener los permisos necesarios.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePanels.map((panel) => {
                const Icon = panel.icon
                return (
                  <Link
                    key={panel.href}
                    href={panel.href}
                    className="group bg-card border rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                            {panel.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {panel.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-auto">
                        {panel.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
