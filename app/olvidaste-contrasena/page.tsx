import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSiteConfig } from "@/lib/site-config"
import { SiteBanner } from "@/components/site-banner"

export default async function ForgotPasswordPage() {
  const siteConfig = await getSiteConfig()

  return (
    <>
      {siteConfig?.header_banner_enabled && (
        <SiteBanner
          text={siteConfig.header_banner_text || ""}
          backgroundColor={siteConfig.header_banner_bg_color}
          textColor={siteConfig.header_banner_text_color}
        />
      )}
      <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
