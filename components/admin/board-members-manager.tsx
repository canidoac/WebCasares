"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, Plus, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember, getAllUsers } from "@/app/admin/club/actions"

interface BoardMember {
  id: number
  position: string
  name: string
  display_order: number
  is_active: boolean
  user_id?: number | null
  user?: {
    id: number
    NOMBRE: string
    APELLIDO: string
    photo_url?: string
    display_name?: string
  } | null
}

interface UserOption {
  id: number
  NOMBRE: string
  APELLIDO: string
  photo_url?: string
  display_name?: string
}

export function BoardMembersManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<BoardMember[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [newMember, setNewMember] = useState({ 
    position: '', 
    name: '',
    user_id: null as number | null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [membersData, usersData] = await Promise.all([
        getBoardMembers(),
        getAllUsers()
      ])
      setMembers(membersData)
      setUsers(usersData)
    } catch (error) {
      console.error('[v0] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.position.trim()) return

    try {
      await createBoardMember(newMember)
      setNewMember({ position: '', name: '', user_id: null })
      await loadData()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error adding member:', error)
      alert('Error al agregar miembro')
    }
  }

  const handleUpdateMember = async (member: BoardMember) => {
    try {
      await updateBoardMember(member.id, {
        position: member.position,
        name: member.name,
        display_order: member.display_order,
        user_id: member.user_id,
      })
      router.refresh()
    } catch (error) {
      console.error('[v0] Error updating member:', error)
      alert('Error al actualizar miembro')
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return

    try {
      await deleteBoardMember(id)
      await loadData()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error deleting member:', error)
      alert('Error al eliminar miembro')
    }
  }

  const getDisplayName = (user?: BoardMember['user'] | null) => {
    if (!user) return ''
    return user.display_name || `${user.NOMBRE} ${user.APELLIDO}`
  }

  if (loading) {
    return <Card><CardContent className="p-6">Cargando...</CardContent></Card>
  }

  return (
    <div className="space-y-4">
      {/* Add New Member */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Agregar Nuevo Miembro</h3>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Posición</Label>
              <Input
                value={newMember.position}
                onChange={(e) => setNewMember(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Ej: Presidente"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Usuario (opcional)</Label>
              <Select
                value={newMember.user_id?.toString() || ""}
                onValueChange={(value) => {
                  const userId = value ? parseInt(value) : null
                  const selectedUser = users.find(u => u.id === userId)
                  setNewMember(prev => ({
                    ...prev,
                    user_id: userId,
                    name: selectedUser 
                      ? (selectedUser.display_name || `${selectedUser.NOMBRE} ${selectedUser.APELLIDO}`)
                      : prev.name
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin usuario vinculado</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.photo_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.NOMBRE[0]}{user.APELLIDO[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.display_name || `${user.NOMBRE} ${user.APELLIDO}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label>Nombre (si no hay usuario)</Label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre completo"
                disabled={!!newMember.user_id}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddMember}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              {member.user && (
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.user.photo_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {member.user.NOMBRE[0]}{member.user.APELLIDO[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Usuario vinculado
                  </span>
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <Label>Posición</Label>
                <Input
                  value={member.position}
                  onChange={(e) => {
                    const updated = members.map(m => 
                      m.id === member.id ? { ...m, position: e.target.value } : m
                    )
                    setMembers(updated)
                  }}
                  onBlur={() => handleUpdateMember(member)}
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Usuario</Label>
                <Select
                  value={member.user_id?.toString() || ""}
                  onValueChange={(value) => {
                    const userId = value ? parseInt(value) : null
                    const selectedUser = users.find(u => u.id === userId)
                    const updated = members.map(m => 
                      m.id === member.id 
                        ? { 
                            ...m, 
                            user_id: userId,
                            name: selectedUser 
                              ? (selectedUser.display_name || `${selectedUser.NOMBRE} ${selectedUser.APELLIDO}`)
                              : m.name
                          } 
                        : m
                    )
                    setMembers(updated)
                    handleUpdateMember({ ...member, user_id: userId })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin usuario vinculado</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.photo_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.NOMBRE[0]}{user.APELLIDO[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.display_name || `${user.NOMBRE} ${user.APELLIDO}`}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Nombre (manual)</Label>
                <Input
                  value={member.name}
                  onChange={(e) => {
                    const updated = members.map(m => 
                      m.id === member.id ? { ...m, name: e.target.value } : m
                    )
                    setMembers(updated)
                  }}
                  onBlur={() => handleUpdateMember(member)}
                  disabled={!!member.user_id}
                  placeholder="Solo si no hay usuario"
                />
              </div>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteMember(member.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
