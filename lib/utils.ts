import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

export function parseNewsSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)/)
  return match ? parseInt(match[1]) : null
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return 'Hace unos segundos'
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'Hace 1 minuto' : `Hace ${diffMinutes} minutos`
  } else if (diffHours < 24) {
    return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`
  } else if (diffDays === 1) {
    return 'Hace 1 día'
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`
  } else if (diffWeeks === 1) {
    return 'Hace 1 semana'
  } else if (diffWeeks < 4) {
    return `Hace ${diffWeeks} semanas`
  } else if (diffMonths === 1) {
    return 'Hace 1 mes'
  } else if (diffMonths < 12) {
    return `Hace ${diffMonths} meses`
  } else if (diffYears === 1) {
    return 'Hace 1 año'
  } else {
    return `Hace ${diffYears} años`
  }
}

export function formatFullDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
