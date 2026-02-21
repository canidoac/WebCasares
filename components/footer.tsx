"use client"

import { useClubColors } from "@/hooks/use-club-colors"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Instagram, MessageCircle } from 'lucide-react'
import Link from "next/link"

interface FooterProps {
  user?: {
    nombre: string
    apellido: string
    email: string
  } | null
}

export function Footer({ user }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { getColor } = useClubColors()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = mounted && theme === 'dark'
  const bgColor = isDarkMode ? getColor('Amarillo', '#ffd700') : getColor('Verde', '#2e8b58')
  const textColor = isDarkMode ? '#000000' : '#ffffff'
  const hoverColor = isDarkMode ? getColor('Verde', '#2e8b58') : getColor('Amarillo', '#ffd700')

  return (
    <footer 
      className="py-3 md:py-4 transition-colors"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center md:gap-4">
          <p 
            className="text-xs sm:text-sm md:text-base leading-relaxed text-center md:text-left"
            style={{ color: textColor }}
          >
            &copy; {currentYear} Club Carlos Casares. Todos los derechos reservados.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              href="https://www.instagram.com/clubcasares/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
              style={{ color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm md:text-base font-medium">Clubcasares</span>
            </Link>

            <Link
              href="https://chat.whatsapp.com/KHLocslWDalL8BwtWL67Gf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
              style={{ color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm md:text-base font-medium">Noticias WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
