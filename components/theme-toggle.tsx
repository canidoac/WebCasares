"use client"

import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-8 w-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: "var(--club-verde)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
      }}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {/* Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun
          className="h-4 w-4 transition-all duration-900"
          style={{
            color: isDark ? "var(--club-blanco)" : "var(--club-negro)",
            //opacity: isDark ? 0.3 : 1,
          }}
        />
        <Moon
          className="h-4 w-4 transition-all duration-900"
          style={{
            color: isDark ? "var(--club-negro)" : "var(--club-blanco)",
            //opacity: isDark ? 1 : 0.3,
          }}
        />
      </div>

      {/* Sliding circle */}
      <div
        className="absolute top-1 h-6 w-6 rounded-full shadow-md transition-transform duration-300"
        style={{
          backgroundColor: "var(--club-blanco)",
          transform: isDark ? "translateX(2rem)" : "translateX(0.25rem)",
        }}
      />
    </button>
  )
}
