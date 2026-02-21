"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Shield, UserCog, Trash2, Volume2, VolumeX, Ban, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUsers, getRoles, updateUserRole, deleteUser, toggleUserMute, toggleUserBlock } from "@/app/admin/usuarios/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface User {
  id: number
  Email: string
  NOMBRE: string
  APELLIDO: string
  socio_number: string
  ROL_ID?: number
  is_muted?: boolean
  is_blocked?: boolean
  muted_reason?: string
  blocked_reason?: string
  created_at: string
  role?: {
    id: number
    name: string
    display_name: string
    color: string
  }
  member_category?: string
}

interface Role {
  id: number
  name: string
  display_name: string
  description: string
  color: string
}

export function UsersManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [muteDialog, setMuteDialog] = useState<{ open: boolean, userId?: number, isMuted: boolean }>({ open: false, isMuted: false })
  const [blockDialog, setBlockDialog] = useState<{ open: boolean, userId?: number, isBlocked: boolean }>({ open: false, isBlocked: false })
  const [moderationReason, setModerationReason] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles(),
      ])
      setUsers(usersData)
      setRoles(rolesData)
    } catch (error) {
      console.error('[v0] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      await updateUserRole(userId, newRoleId)
      await loadData()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error updating role:', error)
      alert('Error al actualizar rol')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return

    try {
      await deleteUser(userId)
      await loadData()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting user:', error)
      alert('Error al eliminar usuario')
    }
  }

  const handleMuteUser = async () => {
    if (!muteDialog.userId) return
    
    try {
      await toggleUserMute(muteDialog.userId, !muteDialog.isMuted, moderationReason)
      await loadData()
      setMuteDialog({ open: false, isMuted: false })
      setModerationReason("")
      router.refresh()
    } catch (error) {
      console.error('[v0] Error muting user:', error)
      alert('Error al silenciar usuario')
    }
  }

  const handleBlockUser = async () => {
    if (!blockDialog.userId) return
    
    try {
      await toggleUserBlock(blockDialog.userId, !blockDialog.isBlocked, moderationReason)
      await loadData()
      setBlockDialog({ open: false, isBlocked: false })
      setModerationReason("")
      router.refresh()
    } catch (error) {
      console.error('[v0] Error blocking user:', error)
      alert('Error al bloquear usuario')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.APELLIDO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.socio_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === "all" || (user.ROL_ID?.toString() === selectedRole)

    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (roleId: number) => {
    if (!roleId) return "bg-gray-500"
    const role = roles.find(r => r.id === roleId)
    if (!role) return "bg-gray-500"
    
    if (role.color === '#10b981') return "bg-green-500"
    if (role.color === '#ef4444') return "bg-red-500"
    if (role.color === '#8b5cf6') return "bg-purple-500"
    return "bg-blue-500"
  }

  const adminCount = users.filter(u => u.ROL_ID && (u.ROL_ID === 55 || u.ROL_ID === 56)).length
  const mutedCount = users.filter(u => u.is_muted).length
  const blockedCount = users.filter(u => u.is_blocked).length

  if (loading) {
    return <Card><CardContent className="p-6">Cargando usuarios...</CardContent></Card>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Socios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {users.filter(u => u.ROL_ID === 1).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Silenciados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{mutedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{blockedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Buscar usuario</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, email o número de socio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Label>Filtrar por rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>N° Socio</TableHead>
                <TableHead>Rol Sitio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className={user.is_blocked ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.NOMBRE?.[0] || 'U'}{user.APELLIDO?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.NOMBRE} {user.APELLIDO}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.socio_number}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.ROL_ID?.toString() || "1"}
                        onValueChange={(value) => handleRoleChange(user.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getRoleBadgeColor(user.ROL_ID || 1)}`} />
                              {user.role?.display_name || roles.find(r => r.id === user.ROL_ID)?.display_name || 'Socio'}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {role.display_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.member_category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.is_muted && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            <VolumeX className="h-3 w-3 mr-1" />
                            Silenciado
                          </Badge>
                        )}
                        {user.is_blocked && (
                          <Badge variant="outline" className="text-red-500 border-red-500">
                            <Ban className="h-3 w-3 mr-1" />
                            Bloqueado
                          </Badge>
                        )}
                        {!user.is_muted && !user.is_blocked && (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMuteDialog({ open: true, userId: user.id, isMuted: !!user.is_muted })}
                          title={user.is_muted ? "Activar comentarios" : "Silenciar comentarios"}
                        >
                          {user.is_muted ? <Volume2 className="h-4 w-4 text-orange-500" /> : <VolumeX className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBlockDialog({ open: true, userId: user.id, isBlocked: !!user.is_blocked })}
                          title={user.is_blocked ? "Desbloquear usuario" : "Bloquear usuario"}
                        >
                          <Ban className={`h-4 w-4 ${user.is_blocked ? 'text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.ROL_ID === 55}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={muteDialog.open} onOpenChange={(open) => setMuteDialog({ ...muteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {muteDialog.isMuted ? 'Activar comentarios' : 'Silenciar usuario'}
            </DialogTitle>
            <DialogDescription>
              {muteDialog.isMuted 
                ? 'El usuario podrá volver a comentar en las noticias.'
                : 'El usuario no podrá comentar en las noticias.'}
            </DialogDescription>
          </DialogHeader>
          {!muteDialog.isMuted && (
            <div className="space-y-2">
              <Label>Razón (opcional)</Label>
              <Textarea
                placeholder="Escribe la razón del silenciamiento..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMuteDialog({ open: false, isMuted: false })}>
              Cancelar
            </Button>
            <Button onClick={handleMuteUser}>
              {muteDialog.isMuted ? 'Activar' : 'Silenciar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockDialog.open} onOpenChange={(open) => setBlockDialog({ ...blockDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockDialog.isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
            </DialogTitle>
            <DialogDescription>
              {blockDialog.isBlocked 
                ? 'El usuario podrá volver a acceder al sistema.'
                : 'El usuario no podrá acceder al sistema.'}
            </DialogDescription>
          </DialogHeader>
          {!blockDialog.isBlocked && (
            <div className="space-y-2">
              <Label>Razón (opcional)</Label>
              <Textarea
                placeholder="Escribe la razón del bloqueo..."
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog({ open: false, isBlocked: false })}>
              Cancelar
            </Button>
            <Button 
              variant={blockDialog.isBlocked ? "default" : "destructive"}
              onClick={handleBlockUser}
            >
              {blockDialog.isBlocked ? 'Desbloquear' : 'Bloquear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
