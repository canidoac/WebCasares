"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, Search } from 'lucide-react'
import { 
  getDisciplinePlayers, 
  addDisciplinePlayer, 
  removeDisciplinePlayer,
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

interface Player {
  id: number
  user_id: number
  position: string | null
  jersey_number: number | null
  is_active: boolean
  joined_date: string
  user: User
}

interface DisciplinePlayersTabProps {
  disciplineId: number
  onUpdate: () => void
}

export function DisciplinePlayersTab({ disciplineId, onUpdate }: DisciplinePlayersTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Player[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [playerData, setPlayerData] = useState({
    position: '',
    jersey_number: ''
  })

  useEffect(() => {
    loadData()
  }, [disciplineId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [playersData, usersData] = await Promise.all([
        getDisciplinePlayers(disciplineId),
        getAllUsers()
      ])
      setPlayers(playersData)
      setAllUsers(usersData)
    } catch (error) {
      console.error('[v0] Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async () => {
    if (!selectedUser) {
      alert('Selecciona un usuario')
      return
    }

    try {
      await addDisciplinePlayer(disciplineId, {
        user_id: selectedUser,
        position: playerData.position || null,
        jersey_number: playerData.jersey_number ? parseInt(playerData.jersey_number) : null
      })
      setShowAddDialog(false)
      setSelectedUser(null)
      setPlayerData({ position: '', jersey_number: '' })
      await loadData()
      onUpdate()
      router.refresh()
    } catch (error: any) {
      console.error('[v0] Error adding player:', error)
      alert(error.message || 'Error al agregar jugador')
    }
  }

  const handleRemovePlayer = async (playerId: number) => {
    if (!confirm('¿Estás seguro de eliminar este jugador?')) return

    try {
      await removeDisciplinePlayer(playerId)
      await loadData()
      onUpdate()
      router.refresh()
    } catch (error) {
      console.error('[v0] Error removing player:', error)
      alert('Error al eliminar jugador')
    }
  }

  const existingUserIds = players.map(p => p.user_id)
  const availableUsers = allUsers.filter(u => !existingUserIds.includes(u.id))
  const filteredUsers = availableUsers.filter(u =>
    `${u.NOMBRE} ${u.APELLIDO} ${u.Email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Jugadores</h2>
          <p className="text-muted-foreground">Gestiona los jugadores de la disciplina</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Jugador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Jugador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

              {selectedUser && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Posición (opcional)</Label>
                      <Input
                        value={playerData.position}
                        onChange={(e) => setPlayerData({ ...playerData, position: e.target.value })}
                        placeholder="Ej: Delantero"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número de Camiseta (opcional)</Label>
                      <Input
                        type="number"
                        value={playerData.jersey_number}
                        onChange={(e) => setPlayerData({ ...playerData, jersey_number: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddPlayer} className="w-full">
                    Agregar Jugador
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Jugadores ({players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={player.user.photo_url || undefined} />
                  <AvatarFallback>
                    {player.user.NOMBRE[0]}{player.user.APELLIDO[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">
                    {player.user.display_name || `${player.user.NOMBRE} ${player.user.APELLIDO}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.position && <span>{player.position}</span>}
                    {player.jersey_number && <span className="ml-2">#{player.jersey_number}</span>}
                    {!player.position && !player.jersey_number && <span>Sin datos adicionales</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePlayer(player.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {players.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay jugadores en esta disciplina
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
