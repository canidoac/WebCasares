import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { FloatingCart } from "@/components/floating-cart"
import { MaintenancePage } from "@/components/maintenance-page"
import { getPublicSiteConfig } from "@/lib/site-config"
import { isAdmin } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Club Carlos Casares",
  description: "Sitio oficial del Club Carlos Casares",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: { url: "/icon.png", type: "image/png" },
  },
    generator: 'v0.app'
}

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let siteStatus: "online" | "maintenance" | "coming_soon" = "online"
  let maintenanceConfig = null
  let userIsAdmin = false

  try {
    const config = await getPublicSiteConfig()
    siteStatus = config.site_status || (config.maintenance_mode ? "maintenance" : "online")
    maintenanceConfig = config
    userIsAdmin = await isAdmin()
  } catch (error) {
    console.error("[v0] Error loading site config:", error)
  }

  const shouldShowMaintenance = siteStatus === "maintenance" && !userIsAdmin && maintenanceConfig
  const shouldShowComingSoon = siteStatus === "coming_soon" && !userIsAdmin && maintenanceConfig

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Material Symbols */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setTheme() {
                  try {
                    var theme = localStorage.getItem('club-theme');
                    var isDark = theme === '"dark"' || theme === 'dark' || 
                                 (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.colorScheme = 'dark';
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.style.colorScheme = 'light';
                    }
                  } catch (e) {}
                }
                setTheme();
                // Re-aplicar en cada navegación SPA
                if (typeof window !== 'undefined') {
                  window.addEventListener('pageshow', setTheme);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          storageKey="club-theme"
        >
          <CartProvider>
            {shouldShowMaintenance ? (
              <MaintenancePage
                title={maintenanceConfig.maintenance_title || "Sitio en Mantenimiento"}
                message={
                  maintenanceConfig.maintenance_message ||
                  "Estamos trabajando para mejorar tu experiencia. Vuelve pronto."
                }
                mediaType={maintenanceConfig.maintenance_media_type}
                mediaUrl={maintenanceConfig.maintenance_media_url}
                showCountdown={maintenanceConfig.maintenance_show_countdown}
                launchDate={maintenanceConfig.maintenance_launch_date}
              />
            ) : shouldShowComingSoon ? (
              <MaintenancePage
                title={maintenanceConfig.coming_soon_title || "Próximamente"}
                message={
                  maintenanceConfig.coming_soon_message || "Estamos preparando algo especial para ti. ¡Vuelve pronto!"
                }
                mediaType="image"
                mediaUrl={maintenanceConfig.coming_soon_image}
                showCountdown={true}
                launchDate={maintenanceConfig.coming_soon_launch_date}
              />
            ) : (
              <>
                {children}
                <FloatingCart />
              </>
            )}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
