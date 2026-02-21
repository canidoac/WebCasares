import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { getPublicSiteConfig, getNavbarItems } from "@/lib/site-config"
import { LoginForm } from "@/components/login-form"
import { SiteBanner } from "@/components/site-banner"

export default async function LoginPage() {
  const config = await getPublicSiteConfig()
  const navbarItems = await getNavbarItems()

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

      <Navbar user={null} navbarItems={navbarItems} />
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa tu email y contraseña para acceder</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm registrationEnabled={config.enable_registration} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
