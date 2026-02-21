"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Trash2, GripVertical, Save, Eye, EyeOff, AlertCircle, Link2, Search, ChevronDown, ChevronRight, Shield, Home, User, ShoppingCart, FileText, Mail, Phone, Info, Calendar, Trophy, Users, Settings, LogIn, LogOut, X, Newspaper, Store, MapPin, Heart, Award, Briefcase, Camera, Clock, CreditCard, Dumbbell, Gift, MessageCircle, Music, Star, BookOpen, Bell } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import {
  type NavbarItem,
  updateNavbarItem,
  createNavbarItem,
  deleteNavbarItem,
} from "@/app/admin/configuracion/navbar-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SitePage {
  id: number
  name: string
  path: string
  description: string | null
  category: string
}

interface SiteRole {
  id: number
  name: string
  display_name: string
  description: string | null
  color: string
}

interface NavbarConfigProps {
  initialItems: NavbarItem[]
}

const availableIcons = [
  { name: 'Home', component: Home },
  { name: 'User', component: User },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'FileText', component: FileText },
  { name: 'Mail', component: Mail },
  { name: 'Phone', component: Phone },
  { name: 'Info', component: Info },
  { name: 'Calendar', component: Calendar },
  { name: 'Trophy', component: Trophy },
  { name: 'Users', component: Users },
  { name: 'Settings', component: Settings },
  { name: 'LogIn', component: LogIn },
  { name: 'LogOut', component: LogOut },
  { name: 'Newspaper', component: Newspaper },
  { name: 'Store', component: Store },
  { name: 'MapPin', component: MapPin },
  { name: 'Heart', component: Heart },
  { name: 'Award', component: Award },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Camera', component: Camera },
  { name: 'Clock', component: Clock },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Gift', component: Gift },
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'Music', component: Music },
  { name: 'Star', component: Star },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Bell', component: Bell },
]

const getIconComponent = (iconName: string | null) => {
  if (!iconName) return null
  const icon = availableIcons.find(i => i.name === iconName)
  return icon ? icon.component : null
}

function PagePickerDialog({ 
  open, 
  onOpenChange, 
  pages, 
  onSelect 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  pages: SitePage[]
  onSelect: (path: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['main'])

  const categories = [
    { id: 'main', label: 'Principal', color: 'text-primary' },
    { id: 'profile', label: 'Perfil', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'auth', label: 'Autenticación', color: 'text-purple-600 dark:text-purple-400' },
    { id: 'admin', label: 'Administración', color: 'text-red-600 dark:text-red-400' },
    { id: 'other', label: 'Otras', color: 'text-gray-600 dark:text-gray-400' },
  ]

  const filteredPages = pages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Página del Sitio</DialogTitle>
          <DialogDescription>
            Elige una página existente del sitio para el item de navegación
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o ruta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Collapsible Categories */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {categories.map(category => {
            const categoryPages = filteredPages.filter(p => p.category === category.id)
            if (categoryPages.length === 0) return null
            
            const isExpanded = expandedCategories.includes(category.id)
            
            return (
              <Collapsible 
                key={category.id}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted/50 transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm font-semibold ${category.color}`}>
                    {category.label}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    ({categoryPages.length})
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {categoryPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => {
                        onSelect(page.path)
                        onOpenChange(false)
                      }}
                      className="text-left w-full p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium text-sm">{page.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{page.path}</div>
                      {page.description && (
                        <div className="text-xs text-muted-foreground/80 mt-1">{page.description}</div>
                      )}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
          
          {filteredPages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron páginas</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RoleSelectorDialog({
  open,
  onOpenChange,
  roles,
  selectedRoles,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: SiteRole[]
  selectedRoles: number[]
  onUpdate: (roles: number[]) => void
}) {
  const [tempSelected, setTempSelected] = useState<number[]>(selectedRoles)

  useEffect(() => {
    setTempSelected(selectedRoles)
  }, [selectedRoles, open])

  const handleToggle = (roleId: number) => {
    setTempSelected(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    )
  }

  const handleSelectAll = () => {
    setTempSelected(roles.map(r => r.id))
  }

  const handleDeselectAll = () => {
    setTempSelected([])
  }

  const handleApply = () => {
    onUpdate(tempSelected)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempSelected(selectedRoles)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Roles</DialogTitle>
          <DialogDescription>
            Los usuarios deben tener uno de estos roles para ver este item
          </DialogDescription>
        </DialogHeader>

        {/* Select All / Deselect All */}
        <div className="flex gap-2 pb-2 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex-1"
          >
            Seleccionar todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="flex-1"
          >
            Deseleccionar todos
          </Button>
        </div>

        {/* Roles List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {roles.map(role => (
            <div
              key={role.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleToggle(role.id)}
            >
              <Checkbox
                id={`role-${role.id}`}
                checked={tempSelected.includes(role.id)}
                onCheckedChange={() => handleToggle(role.id)}
              />
              <label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="font-medium text-sm">{role.display_name}</span>
                </div>
                {role.description && (
                  <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-[#2e8b58] hover:bg-[#26744a]"
          >
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SortableItem({ item, onUpdate, onDelete, pages, roles }: {
  item: NavbarItem
  onUpdate: (id: number, updates: Partial<NavbarItem>) => void
  onDelete: (id: number) => void
  pages: SitePage[]
  roles: SiteRole[]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [showPagePicker, setShowPagePicker] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)

  const statusInfo = {
    visible: { label: 'Visible', icon: Eye, color: 'text-green-600 dark:text-green-400', description: 'El item está visible en la navegación' },
    hidden: { label: 'Oculto', icon: EyeOff, color: 'text-gray-500', description: 'El item está oculto pero puede ser activado' },
    coming_soon: { label: 'Próximamente', icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400', description: 'Muestra como "Próximamente" en la navegación' },
  }

  const currentStatus = statusInfo[item.status]
  const StatusIcon = currentStatus.icon

  const selectedRoles = item.allowed_roles || []
  const handleRoleToggle = (roleId: number) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId]
    onUpdate(item.id, { allowed_roles: newRoles.length > 0 ? newRoles : null })
  }

  const handleRolesUpdate = (newRoles: number[]) => {
    onUpdate(item.id, { allowed_roles: newRoles.length > 0 ? newRoles : null })
  }

  const IconComponent = getIconComponent(item.icon || null)

  return (
    <Card ref={setNodeRef} style={style} className="p-3 md:p-4 border-2 hover:border-primary/50 transition-colors bg-background">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted self-start md:self-center"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Form Fields - Now responsive */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          {/* Etiqueta */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Etiqueta</label>
            <Input
              value={item.label}
              onChange={(e) => onUpdate(item.id, { label: e.target.value })}
              disabled={item.is_protected}
              placeholder="Inicio"
              className="h-9 bg-muted/30"
            />
          </div>

          {/* URL with Page Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">URL</label>
            <div className="flex gap-1">
              <Input
                value={item.href}
                onChange={(e) => onUpdate(item.id, { href: e.target.value })}
                placeholder="/"
                className="h-9 bg-muted/30 flex-1 min-w-0"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 flex-shrink-0" 
                title="Seleccionar página"
                onClick={() => setShowPagePicker(true)}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
            <PagePickerDialog
              open={showPagePicker}
              onOpenChange={setShowPagePicker}
              pages={pages}
              onSelect={(path) => onUpdate(item.id, { href: path })}
            />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icono</label>
            <div className="relative">
              <Button
                variant="outline"
                className="h-9 w-full justify-start text-left font-normal bg-muted/30 pr-8"
                onClick={() => setShowIconPicker(!showIconPicker)}
              >
                {IconComponent ? (
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs truncate">{item.icon}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">Sin icono</span>
                )}
              </Button>
              {item.icon && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-8 hover:bg-transparent"
                  onClick={() => onUpdate(item.id, { icon: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {showIconPicker && (
                <Card className="absolute z-50 mt-1 w-64 p-2 shadow-lg">
                  <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                    {availableIcons.map(({ name, component: Icon }) => (
                      <Button
                        key={name}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-full"
                        onClick={() => {
                          onUpdate(item.id, { icon: name })
                          setShowIconPicker(false)
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Estado with tooltip */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StatusIcon className={`h-3.5 w-3.5 ${currentStatus.color}`} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">{currentStatus.label}</p>
                    <p className="text-xs">{currentStatus.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={item.status}
              onValueChange={(value: NavbarItem["status"]) => onUpdate(item.id, { status: value })}
              disabled={item.is_protected}
            >
              <SelectTrigger className="h-9 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span>Visible</span>
                  </div>
                </SelectItem>
                <SelectItem value="hidden">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    <span>Oculto</span>
                  </div>
                </SelectItem>
                <SelectItem value="coming_soon">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Próximamente</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visible para */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Visible para</label>
            <Select
              value={item.visibility}
              onValueChange={(value: NavbarItem["visibility"]) => onUpdate(item.id, { visibility: value })}
            >
              <SelectTrigger className="h-9 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="logged_in">Con Login</SelectItem>
                <SelectItem value="logged_out">Sin Login</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Roles */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-muted-foreground">Roles</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Roles específicos que pueden ver este item. Si está vacío, usa la configuración de "Visible para"</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="outline"
              className="h-9 w-full justify-start text-left font-normal bg-muted/30"
              onClick={() => setShowRoleSelector(true)}
            >
              {selectedRoles.length === 0 ? (
                <span className="text-muted-foreground text-xs">Ninguno</span>
              ) : (
                <span className="truncate text-xs">
                  {selectedRoles.length} {selectedRoles.length === 1 ? 'rol' : 'roles'}
                </span>
              )}
            </Button>
            <RoleSelectorDialog
              open={showRoleSelector}
              onOpenChange={setShowRoleSelector}
              roles={roles}
              selectedRoles={selectedRoles}
              onUpdate={handleRolesUpdate}
            />
          </div>

          {/* Orden */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Orden</label>
            <Input
              type="number"
              value={item.display_order}
              onChange={(e) => onUpdate(item.id, { display_order: parseInt(e.target.value) || 1 })}
              min={1}
              className="h-9 bg-muted/30"
            />
          </div>
        </div>

        {/* Delete Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                disabled={item.is_protected}
                className="flex-shrink-0 h-9 w-9 hover:bg-destructive/10 hover:text-destructive self-start md:self-center"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {item.is_protected && (
              <TooltipContent>
                <p>Este item está protegido y no puede ser eliminado</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {item.is_protected && (
        <p className="text-xs text-muted-foreground mt-3 ml-0 md:ml-10 flex items-center gap-1.5 text-warning">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>Este item está protegido y no puede ser eliminado u ocultado</span>
        </p>
      )}
    </Card>
  )
}

export function NavbarConfig({ initialItems }:NavbarConfigProps) {
  const [items, setItems] = useState<NavbarItem[]>(initialItems)
  const [pages, setPages] = useState<SitePage[]>([])
  const [roles, setRoles] = useState<SiteRole[]>([])
  const [newItem, setNewItem] = useState({
    label: "",
    href: "",
    status: "visible" as const,
    visibility: "all" as const,
    display_order: initialItems.length + 1,
    allowed_roles: null as number[] | null,
    icon: null as string | null,
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPagePicker, setShowPagePicker] = useState(false)
  const [showNewItemIconPicker, setShowNewItemIconPicker] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadPages()
    loadRoles()
  }, [])

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/site-pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('[v0] Error loading pages:', error)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      }
    } catch (error) {
      console.error('[v0] Error loading roles:', error)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update display_order for all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          display_order: index + 1
        }))
        
        setHasChanges(true)
        return updatedItems
      })
    }
  }

  const handleUpdateItem = (id: number, updates: Partial<NavbarItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    setHasChanges(true)
  }

  const handleAddItem = async () => {
    if (!newItem.label || !newItem.href) {
      alert("Completa todos los campos obligatorios")
      return
    }

    setSaving(true)
    const result = await createNavbarItem(newItem)
    setSaving(false)

    if (result.success && result.id) {
      setItems((prev) => [...prev, { ...newItem, id: result.id!, is_protected: false }])
      setNewItem({
        label: "",
        href: "",
        status: "visible",
        visibility: "all",
        display_order: items.length + 2,
        allowed_roles: null,
        icon: null,
      })
      alert("Item añadido correctamente")
    } else {
      alert(result.error || "Error al crear")
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm("¿Eliminar este item de navegación?")) return

    setSaving(true)
    const result = await deleteNavbarItem(id)
    setSaving(false)

    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      setHasChanges(false)
      alert("Item eliminado correctamente")
    } else {
      alert(result.error || "Error al eliminar")
    }
  }

  const handleApplyChanges = async () => {
    setSaving(true)
    
    try {
      // Update all items with their new order
      for (const item of items) {
        await updateNavbarItem(item.id, {
          label: item.label,
          href: item.href,
          status: item.status,
          visibility: item.visibility,
          display_order: item.display_order,
          allowed_roles: item.allowed_roles,
          icon: item.icon,
        })
      }
      
      setHasChanges(false)
      alert("Cambios aplicados correctamente")
    } catch (error) {
      console.error('[v0] Error applying changes:', error)
      alert("Error al aplicar los cambios")
    } finally {
      setSaving(false)
    }
  }

  const NewIconComponent = getIconComponent(newItem.icon)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Menú de Navegación</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configura los items del menú principal. Arrastra para reordenar.
          </p>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleApplyChanges} 
            disabled={saving}
            className="gap-2 bg-[#2e8b58] hover:bg-[#26744a]"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Aplicando...' : 'Aplicar Cambios'}
          </Button>
        )}
      </div>

      {/* Sortable List */}
      <div className="space-y-3">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                pages={pages}
                roles={roles}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <Card className="p-5 border-2 border-dashed border-muted-foreground/30 bg-muted/10">
        <h4 className="text-sm font-semibold mb-4 text-foreground">Añadir nuevo item</h4>
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Etiqueta *</label>
            <Input
              placeholder="Mi página"
              value={newItem.label}
              onChange={(e) => setNewItem((prev) => ({ ...prev, label: e.target.value }))}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">URL *</label>
            <div className="flex gap-1">
              <Input
                placeholder="/ruta"
                value={newItem.href}
                onChange={(e) => setNewItem((prev) => ({ ...prev, href: e.target.value }))}
                className="h-9 flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9" 
                title="Seleccionar página"
                onClick={() => setShowPagePicker(true)}
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <PagePickerDialog
                open={showPagePicker}
                onOpenChange={setShowPagePicker}
                pages={pages}
                onSelect={(path) => setNewItem(prev => ({ ...prev, href: path }))}
              />
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icono</label>
            <div className="relative">
              <Button
                variant="outline"
                className="h-9 w-full justify-start text-left font-normal pr-8"
                onClick={() => setShowNewItemIconPicker(!showNewItemIconPicker)}
              >
                {NewIconComponent ? (
                  <div className="flex items-center gap-2">
                    <NewIconComponent className="h-4 w-4" />
                    <span className="text-xs truncate">{newItem.icon}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">Opcional</span>
                )}
              </Button>
              {newItem.icon && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-8 hover:bg-transparent"
                  onClick={() => setNewItem(prev => ({ ...prev, icon: null }))}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {showNewItemIconPicker && (
                <Card className="absolute z-50 mt-1 w-64 p-2 shadow-lg">
                  <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                    {availableIcons.map(({ name, component: Icon }) => (
                      <Button
                        key={name}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-full"
                        onClick={() => {
                          setNewItem(prev => ({ ...prev, icon: name }))
                          setShowNewItemIconPicker(false)
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Estado</label>
            <Select
              value={newItem.status}
              onValueChange={(value: NavbarItem["status"]) => setNewItem((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Oculto</SelectItem>
                <SelectItem value="coming_soon">Próximamente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Visible para</label>
            <Select
              value={newItem.visibility}
              onValueChange={(value: NavbarItem["visibility"]) => setNewItem((prev) => ({ ...prev, visibility: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="logged_in">Con Login</SelectItem>
                <SelectItem value="logged_out">Sin Login</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Roles</label>
            <Button variant="outline" className="h-9 w-full justify-start text-left font-normal" disabled>
              <span className="text-muted-foreground text-xs">Opcional</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Orden</label>
            <Input
              type="number"
              value={newItem.display_order}
              onChange={(e) => setNewItem((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
              min={1}
              className="h-9"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleAddItem} 
              disabled={saving || !newItem.label || !newItem.href} 
              className="w-full h-9 bg-[#2e8b58] hover:bg-[#26744a]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
