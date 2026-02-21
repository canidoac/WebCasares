import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSiteConfig } from "@/lib/site-config"
import { SiteBanner } from "@/components/site-banner"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function ResetPasswordPage() {
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
              <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
              <CardDescription>Ingresa tu nueva contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="flex justify-center p-4">Cargando...</div>}>
                <ResetPasswordForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
