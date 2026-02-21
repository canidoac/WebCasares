import { getUser, isAdmin } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems } from "@/lib/site-config"
import { SponsorsManager } from "@/components/admin/sponsors-manager"
import { getSponsors } from "./actions"

export default async function AdminSponsorsPage() {
  const user = await getUser()
  const userIsAdmin = await isAdmin()

  if (!user || !userIsAdmin) {
    redirect("/")
  }

  const navbarItems = await getNavbarItems()
  const sponsors = await getSponsors()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <SponsorsManager initialSponsors={sponsors} />
      </main>
    </div>
  )
}
