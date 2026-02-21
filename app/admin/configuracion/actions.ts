"use server"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth"

export interface SiteConfig {
  show_header_banner: boolean
  header_banner_text?: string
  header_banner_link?: string
  header_banner_color?: string
  header_banner_text_color?: string
  header_banner_color_dark?: string
  header_banner_text_color_dark?: string
  show_popup: boolean
  popup_title?: string
  popup_content?: string
  popup_image?: string
  popup_button_text?: string
  popup_button_link?: string
  popup_opacity?: number
  enable_registration: boolean
  maintenance_mode?: boolean
  maintenance_title?: string
  maintenance_message?: string
  maintenance_media_type?: "none" | "image" | "video"
  maintenance_media_url?: string
  maintenance_show_countdown?: boolean
  maintenance_launch_date?: string
  site_status?: "online" | "maintenance" | "coming_soon"
  coming_soon_title?: string
  coming_soon_message?: string
  coming_soon_image?: string
  coming_soon_launch_date?: string
}

export async function getSiteConfig(): Promise<{ config: SiteConfig | null; tableExists: boolean }> {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error("No autorizado")
  }

  const supabase = await createClient()

  const { data: dataArray, error } = await supabase.from("SiteConfig").select("*").eq("id", 1).limit(1)
  const data = dataArray?.[0]

  if (error && error.code === "PGRST205") {
    return {
      config: null,
      tableExists: false,
    }
  }

  if (error || !data) {
    return {
      config: {
        show_header_banner: false,
        show_popup: false,
        enable_registration: true,
      },
      tableExists: true,
    }
  }

  return {
    config: data,
    tableExists: true,
  }
}

export async function updateSiteConfig(config: SiteConfig) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    return { success: false, error: "No autorizado" }
  }

  try {
    const supabase = await createClient()

    const cleanedConfig = {
      ...config,
      maintenance_launch_date: config.maintenance_launch_date && config.maintenance_launch_date.trim() !== "" 
        ? config.maintenance_launch_date 
        : null,
      coming_soon_launch_date: config.coming_soon_launch_date && config.coming_soon_launch_date.trim() !== "" 
        ? config.coming_soon_launch_date 
        : null,
    }

    const existingFields: Partial<SiteConfig> = {
      show_header_banner: cleanedConfig.show_header_banner,
      header_banner_text: cleanedConfig.header_banner_text,
      header_banner_link: cleanedConfig.header_banner_link,
      header_banner_color: cleanedConfig.header_banner_color,
      header_banner_text_color: cleanedConfig.header_banner_text_color,
      show_popup: cleanedConfig.show_popup,
      popup_title: cleanedConfig.popup_title,
      popup_content: cleanedConfig.popup_content,
      popup_image: cleanedConfig.popup_image,
      popup_button_text: cleanedConfig.popup_button_text,
      popup_button_link: cleanedConfig.popup_button_link,
      enable_registration: cleanedConfig.enable_registration,
      maintenance_mode: cleanedConfig.maintenance_mode,
      maintenance_title: cleanedConfig.maintenance_title,
      maintenance_message: cleanedConfig.maintenance_message,
      maintenance_media_type: cleanedConfig.maintenance_media_type,
      maintenance_media_url: cleanedConfig.maintenance_media_url,
      maintenance_show_countdown: cleanedConfig.maintenance_show_countdown,
      maintenance_launch_date: cleanedConfig.maintenance_launch_date,
    }

    try {
      const { error } = await supabase
        .from("SiteConfig")
        .upsert({ id: 1, ...cleanedConfig, updated_at: new Date().toISOString() })

      if (error) {
        if (error.code === "PGRST204") {
          const { error: basicError } = await supabase
            .from("SiteConfig")
            .upsert({ id: 1, ...existingFields, updated_at: new Date().toISOString() })
          
          if (basicError) throw basicError
          
          return { 
            success: true, 
            warning: "Configuración guardada con campos básicos. Ejecuta el script 015 para usar todas las funcionalidades."
          }
        }
        throw error
      }
    } catch (err: any) {
      if (err.code === "PGRST204" || err.message?.includes("Could not find")) {
        const { error: fallbackError } = await supabase
          .from("SiteConfig")
          .upsert({ id: 1, ...existingFields, updated_at: new Date().toISOString() })
        
        if (fallbackError) throw fallbackError
        
        return { 
          success: true, 
          warning: "Configuración guardada parcialmente. Ejecuta el script SQL 015 desde el panel de Supabase."
        }
      }
      throw err
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating site config:", error)
    return { success: false, error: error.message || "Error al actualizar configuración" }
  }
}
