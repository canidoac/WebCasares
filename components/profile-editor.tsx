"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, CreditCard, ClipboardList } from 'lucide-react'
import { MemberCard } from "@/components/member-card"
import { PersonalInfoForm } from "@/components/personal-info-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  socioNumber: string
  photoUrl?: string
  memberCategory?: string
  bio?: string
  displayName?: string
  birthDate?: string | null
  registrationDate?: string | null
}

export function ProfileEditor({ user }: { user: User }) {
  const [nombre, setNombre] = useState(user.nombre)
  const [apellido, setApellido] = useState(user.apellido)
  const [displayName, setDisplayName] = useState(user.displayName || `${user.nombre} ${user.apellido}`)
  const [bio, setBio] = useState(user.bio || "")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl || null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showMemberCard, setShowMemberCard] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let photoUrl = user.photoUrl

      // Subir foto si fue cambiada
      if (photoFile) {
        const formData = new FormData()
        formData.append("file", photoFile)
        formData.append("folder", "Profile")
        formData.append("filename", `${user.id}`)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          photoUrl = url
        }
      }

      // Actualizar perfil
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          nombre,
          apellido,
          displayName,
          photoUrl,
          bio,
        }),
      })

      if (response.ok) {
        setSuccess("Perfil actualizado correctamente")
        router.refresh()
      } else {
        setError("Error al actualizar el perfil")
      }
    } catch (err) {
      console.error("[v0] Profile update error:", err)
      setError("Ocurrió un error al actualizar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de edición */}
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>Edita tu información personal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                {/* Foto de perfil */}
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback className="text-3xl">
                      {nombre?.[0]}
                      {apellido?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Cambiar foto</span>
                    </div>
                    <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </Label>
                </div>

                {/* Información del socio */}
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Número de Socio</Label>
                  <div className="text-lg font-semibold">{user.socioNumber}</div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Categoría</Label>
                  <div className="text-lg font-semibold">{user.memberCategory || "Socio"}</div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayName">Nombre para mostrar</Label>
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="Cómo quieres que te vean en comentarios"
                    required 
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nombre aparecerá en tus comentarios y likes
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tarjeta de socio */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carnet de Socio</CardTitle>
              <CardDescription>Descarga o comparte tu carnet de socio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ver Carnet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl w-[95vw] p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Tu Carnet de Socio</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 overflow-auto">
                    <MemberCard
                      nombre={nombre}
                      apellido={apellido}
                      socioNumber={user.socioNumber}
                      memberCategory={user.memberCategory || "Socio"}
                      photoUrl={photoPreview || user.photoUrl}
                      dni={user.dni}
                      registrationDate={user.registrationDate ? new Date(user.registrationDate) : new Date()}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Informacion Personal Interna */}
          <Card>
            <CardHeader>
              <CardTitle>Informacion Personal</CardTitle>
              <CardDescription>Datos internos para el club (no visibles en tu perfil publico)</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2" size="lg">
                    <ClipboardList className="h-5 w-5" />
                    Completar Informacion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Informacion Personal</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <PersonalInfoForm />
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-xs text-muted-foreground mt-3">
                Contacto, educacion, trabajo y CV. Solo visible para la administracion.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
