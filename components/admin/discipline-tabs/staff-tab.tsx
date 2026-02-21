"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, Search } from 'lucide-react'
import { 
  getDisciplineStaff, 
  addDisciplineStaffMember, 
  deleteDisciplineStaff,
  getAllUsers 
} from "@/app/admin/disciplinas/actions"
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface User {
  id: number
  NOMBRE: string
  APELLIDO: string
  display_name: string | null
  photo_url: string | null
  Email: string
}

interface StaffMember {
  id: number
  role: string
  name: string
  user_id: number | null
  user: User | null
}

interface DisciplineStaffTabProps {
  disciplineId: number
}

export function DisciplineStaffTab({ disciplineId }: DisciplineStaffTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [staffRole, setStaffRole] = useState('')

  useEffect(() => {
    loadData()
  }, [disciplineId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [staffData, usersData] = await Promise.all([
        getDisciplineStaff(disciplineId),
        getAllUsers()
      ])
      setStaff(staffData)
      setAllUsers(usersData)
    } catch (error) {
      console.error('[v0] Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async () => {
    if (!selectedUser || !staffRole.trim()) {
      alert('Selecciona un usuario y especifica el rol')
      return
    }

    try {
      await addDisciplineStaffMember(disciplineId, {
        user_id: selectedUser,
        role: staffRole
      })
      setShowAddDialog(false)
      setSelectedUser(null)
      setStaffRole('')
      await loadData()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error adding staff:', error)
      alert('Error al agregar miembro del cuerpo técnico')
    }
  }

  const handleRemoveStaff = async (staffId: number) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return

    try {
      await deleteDisciplineStaff(staffId)
      await loadData()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error removing staff:', error)
      alert('Error al eliminar miembro')
    }
  }

  const filteredUsers = allUsers.filter(u =>
    `${u.NOMBRE} ${u.APELLIDO} ${u.Email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cuerpo Técnico</h2>
          <p className="text-muted-foreground">Gestiona el cuerpo técnico de la disciplina</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Miembro del Cuerpo Técnico</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Input
                  placeholder="Ej: DT Principal, Ayudante de Campo, Preparador Físico..."
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Buscar Usuario</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${selectedUser === user.id ? 'bg-primary/10' : ''}`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo_url || undefined} />
                      <AvatarFallback>{user.NOMBRE[0]}{user.APELLIDO[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {user.display_name || `${user.NOMBRE} ${user.APELLIDO}`}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.Email}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser && staffRole && (
                <Button onClick={handleAddStaff} className="w-full">
                  Agregar al Cuerpo Técnico
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Miembros ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {member.user ? (
                  <>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.user.photo_url || undefined} />
                      <AvatarFallback>
                        {member.user.NOMBRE[0]}{member.user.APELLIDO[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{member.role}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.user.display_name || `${member.user.NOMBRE} ${member.user.APELLIDO}`}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1">
                    <div className="font-medium">{member.role}</div>
                    <div className="text-sm text-muted-foreground">{member.name}</div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStaff(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {staff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay miembros en el cuerpo técnico
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
