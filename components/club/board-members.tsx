"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface BoardMember {
  id: number
  position: string
  name: string
  display_order: number
  user?: {
    NOMBRE: string
    APELLIDO: string
    photo_url?: string
    display_name?: string
  } | null
}

interface BoardMembersProps {
  members: BoardMember[]
}

export function BoardMembers({ members }: BoardMembersProps) {
  if (!members || members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No hay miembros de la comisión directiva disponibles.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {member.user ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user.photo_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {member.user.NOMBRE[0]}{member.user.APELLIDO[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-lg">{member.position}</h3>
                <p className="text-muted-foreground">
                  {member.user 
                    ? (member.user.display_name || `${member.user.NOMBRE} ${member.user.APELLIDO}`)
                    : member.name
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
