"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserProfile, saveUserProfile, type UserProfileData } from "@/lib/user-profile-actions"
import { Loader2, Save, FileText, Briefcase, GraduationCap, User, Phone, MapPin, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PersonalInfoFormProps {
  onComplete?: () => void
  compact?: boolean
}

const educationLevels = [
  { value: "primario_incompleto", label: "Primario Incompleto" },
  { value: "primario_completo", label: "Primario Completo" },
  { value: "secundario_incompleto", label: "Secundario Incompleto" },
  { value: "secundario_completo", label: "Secundario Completo" },
  { value: "terciario_incompleto", label: "Terciario Incompleto" },
  { value: "terciario_completo", label: "Terciario Completo" },
  { value: "universitario_incompleto", label: "Universitario Incompleto" },
  { value: "universitario_completo", label: "Universitario Completo" },
  { value: "posgrado", label: "Posgrado" },
]

export function PersonalInfoForm({ onComplete, compact = false }: PersonalInfoFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfileData>>({
    phone: "",
    address: "",
    city: "",
    occupation: "",
    employer: "",
    education_level: "",
    education_institution: "",
    education_career: "",
    cv_url: "",
    skills: "",
    notes: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const profile = await getUserProfile()
      if (profile) {
        setFormData({
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          occupation: profile.occupation || "",
          employer: profile.employer || "",
          education_level: profile.education_level || "",
          education_institution: profile.education_institution || "",
          education_career: profile.education_career || "",
          cv_url: profile.cv_url || "",
          skills: profile.skills || "",
          notes: profile.notes || "",
        })
      }
    } catch (e) {
      console.error("[v0] Error loading profile:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const result = await saveUserProfile(formData)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        onComplete?.()
      } else {
        setError(result.error || "Error al guardar")
      }
    } catch (e) {
      setError("Error al guardar la informacion")
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof UserProfileData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", compact && "space-y-4")}>
      {/* Seccion Contacto */}
      <Card>
        <CardHeader className={cn(compact && "pb-3")}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" />
            Contacto
          </CardTitle>
          {!compact && (
            <CardDescription>Informacion de contacto personal</CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              placeholder="Ej: 2395 12-3456"
              value={formData.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              placeholder="Ej: Carlos Casares"
              value={formData.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              placeholder="Ej: Av. San Martin 123"
              value={formData.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion Laboral */}
      <Card>
        <CardHeader className={cn(compact && "pb-3")}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Situacion Laboral
          </CardTitle>
          {!compact && (
            <CardDescription>Informacion sobre tu trabajo actual</CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="occupation">Ocupacion / Puesto</Label>
            <Input
              id="occupation"
              placeholder="Ej: Contador, Docente, Albañil..."
              value={formData.occupation || ""}
              onChange={(e) => updateField("occupation", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer">Empleador / Empresa</Label>
            <Input
              id="employer"
              placeholder="Ej: Municipalidad, Independiente..."
              value={formData.employer || ""}
              onChange={(e) => updateField("employer", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion Educacion */}
      <Card>
        <CardHeader className={cn(compact && "pb-3")}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Educacion
          </CardTitle>
          {!compact && (
            <CardDescription>Informacion academica</CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="education_level">Nivel Educativo</Label>
            <Select
              value={formData.education_level || ""}
              onValueChange={(v) => updateField("education_level", v)}
            >
              <SelectTrigger id="education_level">
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="education_institution">Institucion</Label>
            <Input
              id="education_institution"
              placeholder="Ej: UNNOBA, ISFD 131..."
              value={formData.education_institution || ""}
              onChange={(e) => updateField("education_institution", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="education_career">Carrera / Curso</Label>
            <Input
              id="education_career"
              placeholder="Ej: Ingenieria en Sistemas, Profesorado de Historia..."
              value={formData.education_career || ""}
              onChange={(e) => updateField("education_career", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion Adicional */}
      <Card>
        <CardHeader className={cn(compact && "pb-3")}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Informacion Adicional
          </CardTitle>
          {!compact && (
            <CardDescription>CV, habilidades y notas</CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="cv_url">URL de CV (Google Drive, LinkedIn, etc.)</Label>
            <Input
              id="cv_url"
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.cv_url || ""}
              onChange={(e) => updateField("cv_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Habilidades / Conocimientos</Label>
            <Textarea
              id="skills"
              placeholder="Ej: Manejo de Office, Idioma Ingles, Primeros auxilios..."
              rows={3}
              value={formData.skills || ""}
              onChange={(e) => updateField("skills", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Cualquier informacion adicional que quieras compartir..."
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton Guardar */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar Informacion"}
        </Button>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {!compact && (
        <p className="text-xs text-muted-foreground">
          Esta informacion es confidencial y solo sera visible para la administracion del club.
          No se mostrara en tu perfil publico.
        </p>
      )}
    </div>
  )
}
