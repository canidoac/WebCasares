"use client"

import { LogOut, Shield, UserCircle, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/auth"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserMenuProps {
  user: {
    nombre: string
    apellido: string
    email: string
    socioNumber?: string
    rolId?: string
    rolNombre?: string
    photoUrl?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const handleLogout = async () => {
    await logout()
  }

  const isAdmin =
    String(user.rolId) === "55" ||
    user.rolId === "Admin" ||
    user.rolNombre?.toLowerCase() === "admin" ||
    user.email === "admin@clubccc.com" ||
    user.email === "admin@clubcasares.com"

  const displayRole = isAdmin ? "Admin" : (user.rolNombre || "Socio")
  const roleColor = isAdmin ? "text-fuchsia-600 dark:text-fuchsia-400" : "text-foreground"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-transparent border-white dark:border-black text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10 overflow-hidden p-0"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoUrl || "/placeholder.svg"} alt={`${user.nombre} ${user.apellido}`} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {user.socioNumber && (
              <div className="bg-club-green/10 dark:bg-club-yellow/10 px-3 py-2 rounded-md border border-club-green/20 dark:border-club-yellow/20">
                <p className="text-xs text-muted-foreground">Número de Socio</p>
                <p className="text-sm font-mono font-bold text-club-green dark:text-club-yellow">{user.socioNumber}</p>
              </div>
            )}
            <div className="bg-muted/50 px-3 py-2 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className={`text-sm font-semibold ${roleColor}`}>{displayRole}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/perfil" className="flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Panel de Administración
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {mounted && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tema</span>
                <ThemeToggle />
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
