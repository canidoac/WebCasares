"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { register } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PersonalInfoForm } from "@/components/personal-info-form"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [dni, setDni] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
  const [registeredSocioNumber, setRegisteredSocioNumber] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB")
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validatePassword = (pass: string): { valid: boolean; message?: string } => {
    if (pass.length < 8) {
      return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" }
    }
    if (!/[A-Z]/.test(pass)) {
      return { valid: false, message: "La contraseña debe tener al menos una letra mayúscula" }
    }
    if (!/[0-9]/.test(pass)) {
      return { valid: false, message: "La contraseña debe tener al menos un número" }
    }
    return { valid: true }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message!)
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (!nombre.trim() || !apellido.trim()) {
      setError("Por favor completa todos los campos")
      setIsLoading(false)
      return
    }

    if (!dni.trim() || dni.length < 7) {
      setError("Por favor ingresa un DNI valido")
      setIsLoading(false)
      return
    }

    if (!birthDate) {
      setError("Por favor ingresa tu fecha de nacimiento")
      setIsLoading(false)
      return
    }

    try {
      let photoUrl: string | undefined

      if (photoFile) {
        const formData = new FormData()
        formData.append("file", photoFile)
        formData.append("folder", "Profile")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          photoUrl = url
        }
      }

      const result = await register(email.toLowerCase(), password, nombre, apellido, dni, birthDate, photoUrl)

      if (result.error) {
        setError(result.error)
      } else {
        setRegisteredSocioNumber(result.socioNumber || null)
        setShowPersonalInfo(true)
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError("Ocurrió un error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  // Paso 2: Informacion personal post-registro
  if (showPersonalInfo) {
    return (
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Registro exitoso</CardTitle>
              <CardDescription>
                {registeredSocioNumber 
                  ? `Tu numero de socio es: ${registeredSocioNumber}` 
                  : "Tu cuenta ha sido creada correctamente"
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completa tu informacion personal</CardTitle>
              <CardDescription>
                Esta informacion es opcional y confidencial. Solo sera visible para la administracion del club.
                Podes completarla ahora o despues desde tu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm compact />
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                router.push("/perfil")
                router.refresh()
              }}
              variant="outline"
              className="gap-2"
            >
              {showPersonalInfo ? "Ir a mi perfil" : "Omitir por ahora"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Completa el formulario para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback className="text-2xl">
                      {nombre?.[0]}
                      {apellido?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Subir foto de perfil (opcional)</span>
                    </div>
                    <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Pérez"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    type="text"
                    placeholder="12345678"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    maxLength={8}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
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
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimo 8 caracteres"
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
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un número
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {successMessage && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
                    {successMessage}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Registrarse"}
                </Button>
                <div className="text-center text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-club-green dark:text-club-yellow hover:underline">
                    Inicia sesión
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
