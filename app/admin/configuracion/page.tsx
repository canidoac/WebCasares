import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Settings } from 'lucide-react'
import { SiteConfigTabbed } from "@/components/admin/site-config-tabbed"
import { getSiteConfig } from "./actions"
import { getNavbarItems } from "./navbar-actions"
import { getPublicSiteConfig } from "@/lib/site-config"
import { createClient } from "@/lib/supabase/server"

export default async function AdminConfigPage() {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  const { config, tableExists } = await getSiteConfig()
  const navbarItems = await getNavbarItems()
  const publicConfig = await getPublicSiteConfig()
  
  const supabase = await createClient()
  const { data: roles } = await supabase
    .from("SiteRole")
    .select("*")
    .order("id")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} config={publicConfig} navbarItems={navbarItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Configuración del Sitio</h1>
              <p className="text-muted-foreground">Personaliza la apariencia y funcionalidades</p>
            </div>
          </div>

          <SiteConfigTabbed 
            config={config} 
            tableExists={tableExists} 
            navbarItems={navbarItems}
            roles={roles || []}
          />
        </div>
      </main>
    </div>
  )
}
