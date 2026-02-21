import { createClient } from "@/lib/supabase/server"
import type { SiteConfig, DbNavbarItem } from "@/lib/site-config-types"

export type { SiteConfig, NavbarItem, DbNavbarItem } from "@/lib/site-config-types"

const DEFAULT_CONFIG: Partial<SiteConfig> = {
  show_header_banner: false,
  show_popup: false,
  enable_registration: true,
  maintenance_mode: false,
  maintenance_title: "",
  maintenance_message: "",
  maintenance_media_type: "none",
  maintenance_media_url: "",
  maintenance_show_countdown: false,
  maintenance_launch_date: "",
}

export async function getNavbarItems(): Promise<DbNavbarItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("NavbarItems").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching navbar items from table:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getNavbarItems:", error)
    return []
  }
}

export async function getPublicSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await createClient()
    const { data: configArray, error } = await supabase
      .from("SiteConfig")
      .select("*")
      .eq("id", 1)
      .limit(1)

    if (error) {
      console.error("[v0] Error fetching site config:", error)
      return DEFAULT_CONFIG as SiteConfig
    }

    const data = configArray?.[0]
    if (!data) {
      return DEFAULT_CONFIG as SiteConfig
    }

    return data as SiteConfig
  } catch (error) {
    console.error("[v0] Error fetching site config:", error)
    return DEFAULT_CONFIG as SiteConfig
  }
}

export const getSiteConfig = getPublicSiteConfig
