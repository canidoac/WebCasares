"use client"

import { useState } from "react"
import { Bell, UserPlus, Navigation, AlertCircle, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import type { SiteConfig } from "@/lib/site-config-types"
import { SiteConfigForm } from "./site-config-form"
import { NavbarConfig } from "./navbar-config"
import type { NavbarItem } from "@/lib/site-config-types"
import { BannerManager } from "./banner-manager"
import { PopupManager } from "./popup-manager"
import type { Role } from "@/lib/permissions"
import { SiteStatusManager } from "./site-status-manager"

interface SiteConfigTabbedProps {
  config: SiteConfig | null
  tableExists: boolean
  navbarItems: NavbarItem[]
  roles: Role[]
}

type Section = "banner" | "popup" | "registro" | "navegacion" | "estado"

export function SiteConfigTabbed({ config, tableExists, navbarItems, roles }: SiteConfigTabbedProps) {
  const [activeSection, setActiveSection] = useState<Section>("banner")

  const sections = [
    { id: "banner" as Section, label: "Banner Superior", icon: Bell },
    { id: "popup" as Section, label: "Popup Inicio", icon: Bell },
    { id: "registro" as Section, label: "Registro de Usuarios", icon: UserPlus },
    { id: "navegacion" as Section, label: "Items de Navegación", icon: Navigation },
    { id: "estado" as Section, label: "Estado del Sitio", icon: Activity },
  ]

  if (!tableExists) {
    return (
      <>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tabla de configuración no encontrada</AlertTitle>
          <AlertDescription>
            Necesitas ejecutar el script <strong>006_create_site_config_table.sql</strong> desde la sección de Scripts
            para crear la tabla de configuración del sitio.
          </AlertDescription>
        </Alert>
        <Link href="/admin">
          <Button variant="outline">Volver al Panel</Button>
        </Link>
      </>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Menú lateral */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{section.label}</span>
              </button>
            )
          })}

          <div className="pt-4 mt-4 border-t">
            <Link href="/admin">
              <Button variant="outline" className="w-full bg-transparent">
                Volver al Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        {activeSection === "navegacion" ? (
          <NavbarConfig initialItems={navbarItems} />
        ) : activeSection === "banner" ? (
          <BannerManager roles={roles} />
        ) : activeSection === "popup" ? (
          <PopupManager roles={roles} />
        ) : activeSection === "estado" ? (
          <SiteStatusManager />
        ) : (
          <SiteConfigForm config={config!} activeSection={activeSection} />
        )}
      </div>
    </div>
  )
}
