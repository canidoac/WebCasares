"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

// Componente interno para sincronizar el tema con el DOM
function ThemeSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const applyTheme = () => {
      const isDark = resolvedTheme === 'dark'
      if (isDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.style.colorScheme = 'light'
      }
    }

    applyTheme()

    // Re-aplicar en navegaciones SPA
    window.addEventListener('pageshow', applyTheme)
    window.addEventListener('popstate', applyTheme)

    return () => {
      window.removeEventListener('pageshow', applyTheme)
      window.removeEventListener('popstate', applyTheme)
    }
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      disableTransitionOnChange
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  )
}
