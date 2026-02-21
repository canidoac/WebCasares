"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, FileImage, FileVideo } from 'lucide-react'
import Image from "next/image"

interface BlobFile {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

interface BlobBrowserProps {
  folder: string
  onSelect: (url: string, type: 'image' | 'gif' | 'video') => void
}

export function BlobBrowser({ folder, onSelect }: BlobBrowserProps) {
  const [files, setFiles] = useState<BlobFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUrl, setSelectedUrl] = useState('')

  useEffect(() => {
    loadFiles()
  }, [folder])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blob/list?folder=${encodeURIComponent(folder)}`)
      const data = await response.json()
      const compatibleFiles = (data.blobs || []).filter((file: BlobFile) => {
        const lower = file.pathname.toLowerCase()
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || 
               lower.endsWith('.png') || lower.endsWith('.gif') || 
               lower.endsWith('.svg') || lower.endsWith('.mp4') || 
               lower.endsWith('.webm')
      })
      setFiles(compatibleFiles)
    } catch (error) {
      console.error('[v0] Error loading blob files:', error)
    } finally {
      setLoading(false)
    }
  }

  const detectFileType = (pathname: string): 'image' | 'gif' | 'video' => {
    const lower = pathname.toLowerCase()
    if (lower.endsWith('.gif')) return 'gif'
    if (lower.endsWith('.mp4') || lower.endsWith('.webm')) return 'video'
    return 'image'
  }

  const handleSelect = (file: BlobFile) => {
    const type = detectFileType(file.pathname)
    setSelectedUrl(file.url)
    onSelect(file.url, type)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay archivos en esta carpeta. Sube uno primero.
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="grid grid-cols-4 gap-2">
        {files.map((file) => {
          const type = detectFileType(file.pathname)
          const isSelected = selectedUrl === file.url
          
          return (
            <button
              key={file.url}
              onClick={() => handleSelect(file)}
              className={`relative group aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {type === 'image' || type === 'gif' ? (
                <Image
                  src={file.url || "/placeholder.svg"}
                  alt={file.pathname}
                  fill
                  className="object-cover"
                  unoptimized={type === 'gif'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <FileVideo className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-xs text-center px-1">
                  <p className="font-medium truncate text-[10px]">{file.pathname.split('/').pop()}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
