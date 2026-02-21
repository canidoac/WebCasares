export interface SiteConfig {
  show_header_banner: boolean
  header_banner_text?: string
  header_banner_button_text?: string
  header_banner_link?: string
  header_banner_show_button?: boolean
  header_banner_color?: string
  header_banner_text_color?: string
  header_banner_bg_color?: string
  header_banner_color_dark?: string
  header_banner_text_color_dark?: string
  header_banner_button_color?: string
  header_banner_button_color_dark?: string
  header_banner_button_text_color?: string
  header_banner_button_text_color_dark?: string
  show_popup: boolean
  popup_title?: string
  popup_content?: string
  popup_image?: string
  popup_button_text?: string
  popup_button_link?: string
  popup_opacity?: number
  enable_registration: boolean
  site_status?: "online" | "maintenance" | "coming_soon"
  maintenance_mode?: boolean // Mantener por compatibilidad
  maintenance_title?: string
  maintenance_message?: string
  maintenance_media_type?: "none" | "image" | "video"
  maintenance_media_url?: string
  maintenance_show_countdown?: boolean
  maintenance_launch_date?: string
  coming_soon_title?: string
  coming_soon_message?: string
  coming_soon_image?: string
  coming_soon_launch_date?: string
  navbar_logo_url?: string
  navbar_items?: DbNavbarItem[]
}

export interface ClubColor {
  id: string
  name: string
  hex_value: string
  description?: string
  is_primary: boolean
  display_order: number
}

export interface NavbarItem {
  label: string
  href: string
  status: "visible" | "hidden" | "coming_soon"
  visibility?: "all" | "logged_in" | "logged_out"
  icon?: string
}

export interface DbNavbarItem {
  id: number
  label: string
  href: string
  status: "visible" | "hidden" | "coming_soon"
  visibility: "all" | "logged_in" | "logged_out"
  display_order: number
  is_protected: boolean
  icon?: string
}
