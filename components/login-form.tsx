"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from "next/link"

interface LoginFormProps {
  registrationEnabled?: boolean
  redirectPath?: string
}

export function LoginForm({ registrationEnabled = true, redirectPath = "/" }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Login: Iniciando proceso de autenticación")

    try {
      const result = await login(email.toLowerCase().trim(), password)

      if (result.error) {
        console.log("[v0] Login: Error de autenticación", result.error)
        setError(result.error)
        setIsLoading(false)
      } else {
        console.log("[v0] Login: Autenticación exitosa, redirigiendo a", redirectPath)
        window.location.replace(redirectPath)
      }
    } catch (err) {
      console.log("[v0] Login: Error inesperado", err)
      setError("Ocurrió un error al iniciar sesión")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <div className="flex flex-col gap-6">
        {isLoading && (
          <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg border-2 border-primary/20">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm font-medium">Iniciando sesión...</p>
              <p className="text-xs text-muted-foreground">Por favor espera un momento</p>
            </div>
          </div>
        )}
        
        {!isLoading && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/olvidaste-contrasena"
                  className="text-sm text-club-green dark: text-club-green  hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>

            <div className="text-center text-sm">
              {registrationEnabled ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <Link href="/register" className="text-club-green dark:text-club-yellow hover:underline">
                    Regístrate aquí
                  </Link>
                </>
              ) : (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    El registro no está disponible por el momento. Por favor, intenta más tarde.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  )
}
