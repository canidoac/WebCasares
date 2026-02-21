"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2, Search, X, UserPlus, UserCog, Loader2 } from "lucide-react"
import {
  addDisciplinePlayer,
  removeDisciplinePlayer,
  addDisciplineStaff,
  deleteDisciplineStaff,
  getAllUsers,
  getDisciplinePlayers,
} from "@/app/admin/disciplinas/actions"

// ============================================================
// Boton para agregar jugador
// ============================================================
export function AddPlayerButton({ disciplineId }: { disciplineId: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [existingPlayerIds, setExistingPlayerIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [position, setPosition] = useState("")
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && users.length === 0) {
      setLoadingUsers(true)
      try {
        const [allUsers, players] = await Promise.all([
          getAllUsers(),
          getDisciplinePlayers(disciplineId),
        ])
        setUsers(allUsers)
        setExistingPlayerIds(players.map((p: any) => p.user_id))
      } catch (error) {
        console.error("Error loading users:", error)
      } finally {
        setLoadingUsers(false)
      }
    }
  }

  const availableUsers = users.filter(
    (u) =>
      !existingPlayerIds.includes(u.id) &&
      `${u.NOMBRE} ${u.APELLIDO} ${u.Email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      await addDisciplinePlayer(disciplineId, {
        user_id: selectedUser,
        position: position || null,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      })
      setOpen(false)
      setSelectedUser(null)
      setPosition("")
      setJerseyNumber("")
      setSearchTerm("")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al agregar jugador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar Jugador
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Jugador</DialogTitle>
          <DialogDescription>
            Busca un socio para agregarlo al plantel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-lg">
            {loadingUsers ? (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cargando usuarios...
              </div>
            ) : availableUsers.length > 0 ? (
              availableUsers.slice(0, 20).map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                    selectedUser === user.id
                      ? "bg-primary/10 border-l-2 border-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photo_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {user.NOMBRE?.[0]}
                      {user.APELLIDO?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {user.display_name || `${user.NOMBRE} ${user.APELLIDO}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.Email}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm
                  ? "No se encontraron usuarios"
                  : "No hay usuarios disponibles"}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Posicion (opcional)</Label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ej: Delantero"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Camiseta (opcional)</Label>
                  <Input
                    type="number"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    placeholder="10"
                    className="h-9"
                  />
                </div>
              </div>
              <Button
                onClick={handleAdd}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Agregar al Plantel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Boton para eliminar jugador
// ============================================================
export function RemovePlayerButton({
  playerId,
  playerName,
}: {
  playerId: number
  playerName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      await removeDisciplinePlayer(playerId)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al eliminar jugador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
          title="Eliminar jugador"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Jugador</AlertDialogTitle>
          <AlertDialogDescription>
            Estas seguro de que quieres eliminar a{" "}
            <strong>{playerName}</strong> del plantel? Esta accion no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================================
// Boton para agregar miembro del cuerpo tecnico
// ============================================================
export function AddStaffButton({ disciplineId }: { disciplineId: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  const handleAdd = async () => {
    if (!name.trim() || !role.trim()) {
      alert("Completa nombre y rol")
      return
    }
    setLoading(true)
    try {
      await addDisciplineStaff(disciplineId, {
        name: name.trim(),
        role: role.trim(),
      })
      setOpen(false)
      setName("")
      setRole("")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al agregar miembro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <UserCog className="h-4 w-4" />
          Agregar Staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar al Cuerpo Tecnico</DialogTitle>
          <DialogDescription>
            Agrega un nuevo miembro al cuerpo tecnico
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre Completo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Perez"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rol / Cargo</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: Director Tecnico"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading || !name.trim() || !role.trim()}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Boton para eliminar miembro del cuerpo tecnico
// ============================================================
export function RemoveStaffButton({
  staffId,
  staffName,
}: {
  staffId: number
  staffName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      await deleteDisciplineStaff(staffId)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Error al eliminar miembro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
          title="Eliminar miembro"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Miembro</AlertDialogTitle>
          <AlertDialogDescription>
            Estas seguro de que quieres eliminar a{" "}
            <strong>{staffName}</strong> del cuerpo tecnico?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
