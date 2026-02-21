import { getUser } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { getNavbarItems, getPublicSiteConfig } from "@/lib/site-config"
import { ProfileEditor } from "@/components/profile-editor"

export default async function ProfilePage() {
  const user = await getUser()
  const navbarItems = await getNavbarItems()
  const config = await getPublicSiteConfig()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} config={config} navbarItems={navbarItems} />
      <main className="flex-1">
        <ProfileEditor user={user} />
      </main>
    </div>
  )
}
