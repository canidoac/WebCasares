"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Shield, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { getRoles, createRole, updateRole, deleteRole } from "@/app/admin/roles/actions"
import { toast } from "@/hooks/use-toast"
import { RoleDisciplinesEditor } from "./role-disciplines-editor"
import { createClient } from "@/lib/supabase/client"

interface Role {
  id: number
  name: string
  display_name: string
  description: string | null
  color: string
  permissions: Record<string, any>
  is_system_role: boolean
  created_at: string
  updated_at: string
  disciplines?: any[]
}

const DEFAULT_PERMISSIONS = {
  panel_admin: false,
  manage_club: false,
  manage_disciplines: false,
  manage_calendar: false,
  manage_news_admin: false,
  manage_users_admin: false,
  manage_roles_admin: false,
  manage_sponsors: false,
  manage_store_admin: false,
  manage_surveys: false,
  manage_navbar: false,
  manage_site_config: false,
  manage_banners: false,
  manage_popups: false,
  manage_colors: false,
  view_analytics: false,
  manage_own_profile: true,
  view_news: true,
  view_store: true,
}

const PERMISSION_GROUPS = {
  basico: {
    label: "Acceso Básico",
    description: "Permisos básicos para todos los usuarios",
    permissions: {
      manage_own_profile: "Gestionar Perfil Propio",
      view_news: "Ver Noticias",
      view_store: "Ver Tienda",
    }
  },
  admin: {
    label: "Administración",
    description: "Acceso al panel de administración y sus módulos",
    requiresParent: "panel_admin",
    permissions: {
      panel_admin: "Acceso al Panel de Admin",
      manage_club: "Gestión del Club",
      manage_disciplines: "Gestión de Disciplinas",
      manage_calendar: "Gestión del Calendario (Partidos/Resultados)",
      manage_news_admin: "Gestión de Noticias",
      manage_users_admin: "Gestión de Usuarios",
      manage_roles_admin: "Gestión de Roles",
      manage_sponsors: "Gestión de Sponsors",
      manage_store_admin: "Gestión de Tienda",
      manage_surveys: "Gestión de Encuestas",
      view_analytics: "Ver Analíticas",
    }
  },
  config: {
    label: "Configuración del Sitio",
    description: "Gestión de aspecto y configuración del sitio",
    requiresParent: "panel_admin",
    permissions: {
      manage_navbar: "Configuración Navbar",
      manage_site_config: "Configuración General",
      manage_banners: "Gestionar Banners",
      manage_popups: "Gestionar Popups",
      manage_colors: "Gestionar Colores del Club",
    }
  },
}

export function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null)
  
  const [disciplines, setDisciplines] = useState<any[]>([])
  const [selectedDisciplines, setSelectedDisciplines] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    color: "#6366f1",
    permissions: DEFAULT_PERMISSIONS,
  })

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    basico: true,
    admin: true,
    config: true,
  })

  useEffect(() => {
    loadRoles()
    loadDisciplines()
  }, [])

  const loadDisciplines = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('Disciplines')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      setDisciplines(data || [])
    } catch (error) {
      console.error('Error loading disciplines:', error)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await getRoles()
      setRoles(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = async (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        display_name: role.display_name,
        description: role.description || "",
        color: role.color,
        permissions: { ...DEFAULT_PERMISSIONS, ...role.permissions },
      })
      
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('RoleDisciplines')
          .select('*')
          .eq('role_id', role.id)

        if (error) throw error
        setSelectedDisciplines(data || [])
      } catch (error) {
        console.error('Error loading role disciplines:', error)
        setSelectedDisciplines([])
      }
    } else {
      setEditingRole(null)
      setFormData({
        name: "",
        display_name: "",
        description: "",
        color: "#6366f1",
        permissions: DEFAULT_PERMISSIONS,
      })
      setSelectedDisciplines([])
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del rol es requerido",
        variant: "destructive",
      })
      return
    }

    if (!editingRole && !formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre clave del rol es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          display_name: formData.display_name,
          description: formData.description,
          color: formData.color,
          permissions: formData.permissions,
          disciplines: selectedDisciplines,
        })
        toast({
          title: "Rol actualizado",
          description: "El rol se actualizó correctamente",
        })
      } else {
        await createRole({
          ...formData,
          disciplines: selectedDisciplines,
        })
        toast({
          title: "Rol creado",
          description: "El nuevo rol se creó correctamente",
        })
      }
      setDialogOpen(false)
      loadRoles()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el rol",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingRoleId) return

    try {
      await deleteRole(deletingRoleId)
      toast({
        title: "Rol eliminado",
        description: "El rol se eliminó correctamente",
      })
      setDeleteDialogOpen(false)
      setDeletingRoleId(null)
      loadRoles()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el rol",
        variant: "destructive",
      })
    }
  }

  const handlePermissionChange = (key: string, value: boolean) => {
    const newPermissions = {
      ...formData.permissions,
      [key]: value,
    }

    if (key === 'panel_admin' && !value) {
      Object.keys(PERMISSION_GROUPS.admin.permissions).forEach(permKey => {
        if (permKey !== 'panel_admin') {
          newPermissions[permKey] = false
        }
      })
      Object.keys(PERMISSION_GROUPS.config.permissions).forEach(permKey => {
        newPermissions[permKey] = false
      })
    }

    setFormData({
      ...formData,
      permissions: newPermissions,
    })
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups({
      ...expandedGroups,
      [groupKey]: !expandedGroups[groupKey],
    })
  }

  if (loading) {
    return <div className="text-center py-8">Cargando roles...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Administra los roles y permisos de usuarios del sistema
        </p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <CardTitle className="text-lg">{role.display_name}</CardTitle>
                </div>
                {role.is_system_role && (
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    Sistema
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs font-mono">
                {role.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Permisos:</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions).map(([key, value]) => {
                    if (value === true) {
                      return (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      )
                    }
                    return null
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(role)}
                  className="flex-1"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                {!role.is_system_role && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeletingRoleId(role.id)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Editar Rol" : "Crear Nuevo Rol"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Modifica los permisos y configuración del rol"
                : "Define el nombre, permisos y disciplinas del nuevo rol"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingRole && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre clave (interno)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, "_") })
                  }
                  placeholder="ej: delegado"
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas y guiones bajos. No se puede cambiar después.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre para mostrar</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="ej: Delegado"
                disabled={editingRole?.is_system_role}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe las responsabilidades de este rol"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Label>Permisos</Label>
              <div className="space-y-2">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                  const isExpanded = expandedGroups[groupKey]
                  const requiresParent = group.requiresParent
                  const isParentActive = requiresParent ? formData.permissions[requiresParent] : true
                  
                  return (
                    <div key={groupKey} className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div className="text-left">
                            <div className="font-semibold">{group.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {group.description}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {Object.values(group.permissions).filter((_, i) => 
                            formData.permissions[Object.keys(group.permissions)[i]]
                          ).length} / {Object.keys(group.permissions).length}
                        </Badge>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-background">
                          {Object.entries(group.permissions).map(([key, label]) => {
                            const isDisabled = requiresParent && key !== requiresParent && !isParentActive
                            
                            return (
                              <div key={key} className="flex items-center justify-between">
                                <Label 
                                  htmlFor={key} 
                                  className={`text-sm font-normal cursor-pointer ${isDisabled ? 'text-muted-foreground' : ''}`}
                                >
                                  {label}
                                  {key === requiresParent && (
                                    <span className="ml-2 text-xs text-muted-foreground">(requerido)</span>
                                  )}
                                </Label>
                                <Switch
                                  id={key}
                                  checked={formData.permissions[key] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(key, checked)
                                  }
                                  disabled={isDisabled}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {(formData.permissions.manage_disciplines || formData.permissions.manage_calendar) && (
              <RoleDisciplinesEditor
                roleId={editingRole?.id}
                disciplines={disciplines}
                selectedDisciplines={selectedDisciplines}
                onChange={setSelectedDisciplines}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingRole ? "Actualizar" : "Crear"} Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingRoleId(null)
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
