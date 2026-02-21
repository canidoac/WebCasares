"use client"

import Link from "next/link"
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

interface SiteBannerProps {
  text: string
  link?: string
  buttonText?: string
  showButton?: boolean
  color?: string
  textColor?: string
  colorDark?: string
  textColorDark?: string
  buttonColor?: string
  buttonColorDark?: string
  buttonTextColor?: string
  buttonTextColorDark?: string
  forceTheme?: 'light' | 'dark'
}

export function SiteBanner({ 
  text, 
  link, 
  buttonText = "Ir",
  showButton = true,
  color = "#2e8b58", 
  textColor = "#ffffff", 
  colorDark, 
  textColorDark,
  buttonColor = "#2e8b58",
  buttonColorDark = "#ffd700",
  buttonTextColor = "#ffffff",
  buttonTextColorDark = "#000000",
  forceTheme
}: SiteBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const dismissed = sessionStorage.getItem("banner-dismissed")
    if (dismissed) {
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem("banner-dismissed", "true")
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleShow = () => {
    setIsCollapsed(false)
    setIsVisible(true)
    sessionStorage.removeItem("banner-dismissed")
  }

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const effectiveTheme = forceTheme || theme
  const currentBgColor = mounted && effectiveTheme === "dark" ? (colorDark || color) : color
  const currentTextColor = mounted && effectiveTheme === "dark" ? (textColorDark || textColor) : textColor
  const currentButtonBgColor = mounted && effectiveTheme === "dark" ? buttonColorDark : buttonColor
  const currentButtonTextColor = mounted && effectiveTheme === "dark" ? buttonTextColorDark : buttonTextColor

  if (!isVisible) {
    return (
      <button
        onClick={handleShow}
        className="fixed top-0 right-4 z-50 py-1 px-3 rounded-b-md text-xs font-medium shadow-lg hover:opacity-90 transition-opacity"
        style={{ backgroundColor: currentBgColor, color: currentTextColor }}
        aria-label="Mostrar banner"
      >
        <ChevronDown className="h-3 w-3" />
      </button>
    )
  }

  if (isCollapsed) {
    return (
      <div
        className="relative w-full py-1 px-4 flex items-center justify-center"
        style={{ backgroundColor: currentBgColor, color: currentTextColor }}
      >
        <button
          onClick={handleToggleCollapse}
          className="hover:opacity-70"
          style={{ color: currentTextColor }}
          aria-label="Expandir banner"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="relative w-full py-3 px-4 text-center font-medium"
      style={{ backgroundColor: currentBgColor, color: currentTextColor }}
    >
      <div className="flex items-center justify-center gap-2 pr-16">
        <span>{renderText(text)}</span>
        
        {link && showButton && (
          <Link href={link}>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-3 text-xs shrink-0"
              style={{ 
                backgroundColor: currentButtonBgColor,
                color: currentButtonTextColor,
                border: 'none'
              }}
            >
              {buttonText}
            </Button>
          </Link>
        )}
      </div>
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button
          onClick={handleToggleCollapse}
          className="hover:opacity-70 p-1"
          style={{ color: currentTextColor }}
          aria-label="Ocultar banner"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleDismiss}
          className="hover:opacity-70 p-1"
          style={{ color: currentTextColor }}
          aria-label="Cerrar banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
