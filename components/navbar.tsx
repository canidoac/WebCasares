"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Menu, Moon, Sun, X, ShoppingBag, Users, Clock, LogIn, Home, Trophy, Newspaper, Calendar, Store, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import type { SiteConfig } from "@/lib/site-config-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useClubColors } from "@/hooks/use-club-colors"
import * as LucideIcons from 'lucide-react'

interface NavbarProps {
  user?: {
    nombre: string
    apellido: string
    email: string
    socioNumber?: string
    rolId?: string
    rolNombre?: string
  } | null
  config?: SiteConfig
  navbarItems?: Array<{
    id: number
    label: string
    href: string
    status: "visible" | "hidden" | "coming_soon"
    visibility: "all" | "logged_in" | "logged_out"
    display_order: number
    is_protected: boolean
    icon?: string
  }>
}

export function Navbar({ user, config, navbarItems }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { getColor } = useClubColors()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const items = navbarItems || config?.navbar_items || []

  const visibleItems = items
    .filter((item) => {
      if (item.status !== "visible" && item.status !== "coming_soon") {
        return false
      }

      const visibility = item.visibility || "all"
      if (visibility === "logged_in" && !user) return false
      if (visibility === "logged_out" && user) return false

      return true
    })
    .sort((a, b) => a.display_order - b.display_order)

  const isDarkMode = mounted && theme === 'dark'
  const bgColor = isDarkMode ? getColor('Amarillo', '#ffd700') : getColor('Verde', '#2e8b58')
  const textColor = isDarkMode ? '#000000' : '#ffffff'
  const hoverBg = isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'

  const renderIcon = (iconName?: string | null) => {
    if (!iconName) return null
    
    const IconComponent = (LucideIcons as any)[iconName]
    if (!IconComponent) return null
    
    return <IconComponent className="mr-1.5 h-4 w-4" />
  }

  return (
    <header 
      className="sticky top-0 w-full border-b z-50 transition-colors"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="w-full flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <div className="relative h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 transition-transform duration-300 group-hover:scale-110">
              <Image
                src={config?.navbar_logo_url || "/images/logo-club.png"}
                alt="Logo Club Carlos Casares"
                fill
                className="object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-md"
                priority
              />
            </div>
            <span className="text-base md:text-xl lg:text-2xl font-bold hidden sm:inline" style={{ color: textColor }}>
              Club Carlos Casares
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-4 xl:space-x-6">
          <TooltipProvider>
            {visibleItems.map((item) => {
              if (item.status === "coming_soon") {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex items-center gap-1.5 text-white/60 cursor-not-allowed"
                        style={{ color: `${textColor}99` }}
                      >
                        {renderIcon(item.icon)}
                        <span className="text-sm">{item.label}</span>
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Esta sección estará disponible próximamente</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white hover:text-white/80 flex items-center px-2.5 py-2 rounded transition-all text-sm ${
                    isActive(item.href) ? "bg-white/20 font-semibold" : ""
                  }`}
                  style={{ 
                    color: textColor,
                    backgroundColor: isActive(item.href) ? hoverBg : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.backgroundColor = hoverBg
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {renderIcon(item.icon)}
                  {item.label}
                </Link>
              )
            })}
          </TooltipProvider>
          {!user && (
            <>
              <ThemeToggle />
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  style={{ 
                    borderColor: textColor,
                    color: textColor
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            </>
          )}
          {user && <UserMenu user={user} />}
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {!user && <ThemeToggle />}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMenu}
            className="bg-transparent border-white text-white hover:bg-white/10 h-9 w-9"
            style={{ 
              borderColor: textColor,
              color: textColor
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div 
          className="w-full lg:hidden bg-club-green dark:bg-slate-900 text-white border-t border-white/10"
          style={{ 
            backgroundColor: bgColor,
            color: textColor,
            borderColor: `${textColor}33`
          }}
        >
          <nav className="flex flex-col py-2 px-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {visibleItems.map((item) => {
              if (item.status === "coming_soon") {
                return (
                  <div key={item.href} className="flex items-center justify-between py-3 px-3 border-b border-white/10">
                    <div className="text-white flex items-center gap-2 opacity-60">
                      {renderIcon(item.icon)}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="text-xs bg-white/20 text-white px-2 py-1 rounded-md flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pronto
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center py-3 px-3 rounded-lg text-white hover:bg-white/10 transition-all border-b border-white/10 ${
                    isActive(item.href) ? "bg-white/20 font-semibold" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {renderIcon(item.icon)}
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}

            {!user && (
              <Link
                href="/login"
                className="flex items-center justify-center mt-3 bg-white/10 py-3 px-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Iniciar Sesión</span>
              </Link>
            )}

            {user && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user.nombre} {user.apellido}
                    </span>
                    <span className="text-xs text-white/70 truncate">{user.email}</span>
                  </div>
                  <UserMenu user={user} />
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
