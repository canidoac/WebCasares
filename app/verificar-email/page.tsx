import { Suspense } from "react"
import { VerifyEmailContent } from "@/components/verify-email-content"
import { getSiteConfig } from "@/lib/site-config"
import { SiteBanner } from "@/components/site-banner"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function VerifyEmailPage() {
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
        <Suspense fallback={<div className="flex justify-center p-4">Cargando...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </>
  )
}
