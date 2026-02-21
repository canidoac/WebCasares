import { Navbar } from "@/components/navbar"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { RegisterForm } from "@/components/register-form"
import { SiteBanner } from "@/components/site-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()

  if (!config.enable_registration) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {config.show_header_banner && config.header_banner_text && (
        <SiteBanner
          text={config.header_banner_text}
          link={config.header_banner_link}
          color={config.header_banner_color}
          textColor={config.header_banner_text_color}
        />
      )}

      <Navbar user={null} config={config} navbarItems={navbarItems} />
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>Ingresa tus datos para registrarte</CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
