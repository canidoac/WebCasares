"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, LinkIcon, X, Loader2, FolderOpen } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { BlobBrowser } from "./blob-browser"

interface MediaUploaderProps {
  currentUrl?: string
  currentType?: 'image' | 'gif' | 'video' | 'audio' | 'youtube'
  onMediaChange: (url: string, type: 'image' | 'gif' | 'video' | 'audio' | 'youtube') => void
  maxSizeMB?: number
  folder: string
  acceptedTypes?: string
}

export function MediaUploader({ 
  currentUrl, 
  currentType, 
  onMediaChange,
  maxSizeMB = 5,
  folder,
  acceptedTypes = "image/*,video/mp4,video/webm"
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '')
  const [previewType, setPreviewType] = useState<'image' | 'gif' | 'video' | 'audio' | 'youtube'>(currentType || 'image')
  const [externalUrl, setExternalUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [blobConfigured, setBlobConfigured] = useState(false)

  useEffect(() => {
    fetch('/api/upload/check')
      .then(res => res.json())
      .then(data => setBlobConfigured(data.configured))
      .catch(() => setBlobConfigured(false))
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      alert(`El archivo no puede superar ${maxSizeMB}MB`)
      return
    }

    let mediaType: 'image' | 'gif' | 'video' | 'audio' | 'youtube' = 'image'
    if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.ogg')) {
      mediaType = 'audio'
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video'
    } else if (file.type === 'image/gif') {
      mediaType = 'gif'
    } else if (file.type.startsWith('image/')) {
      mediaType = 'image'
    } else {
      alert('Solo se permiten imágenes (JPG, PNG, GIF, SVG), videos (MP4, WebM) y audios (MP3, WAV, OGG)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir archivo')
      }

      const data = await response.json()
      setPreviewUrl(data.url)
      setPreviewType(mediaType)
      onMediaChange(data.url, mediaType)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Error al subir el archivo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleExternalUrl = () => {
    if (!externalUrl) return

    let mediaType: 'image' | 'gif' | 'video' | 'audio' | 'youtube' = 'image'
    const lower = externalUrl.toLowerCase()
    
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      mediaType = 'youtube'
    } else if (lower.includes('vimeo.com') || lower.endsWith('.mp4') || lower.endsWith('.webm')) {
      mediaType = 'video'
    } else if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a')) {
      mediaType = 'audio'
    } else if (lower.endsWith('.gif')) {
      mediaType = 'gif'
    }

    setPreviewUrl(externalUrl)
    setPreviewType(mediaType)
    onMediaChange(externalUrl, mediaType)
    setExternalUrl('')
  }

  const handleBlobSelect = (url: string, type: 'image' | 'gif' | 'video' | 'audio' | 'youtube') => {
    setPreviewUrl(url)
    setPreviewType(type)
    onMediaChange(url, type)
  }

  const handleClear = () => {
    setPreviewUrl('')
    setPreviewType('image')
    onMediaChange('', 'image')
  }

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = ''
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      return url
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  return (
    <div className="space-y-4">
      {!blobConfigured && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-sm text-warning">
            <strong>Nota:</strong> La subida de archivos requiere configurar la variable de entorno <code className="bg-warning/20 px-1 rounded">BLOB_READ_WRITE_TOKEN</code>. Por ahora, usa URLs externas.
          </p>
        </div>
      )}

      <Tabs defaultValue={blobConfigured ? "upload" : "url"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="upload" 
            disabled={!blobConfigured}
            className="data-[state=active]:bg-[var(--club-verde)] data-[state=active]:text-[var(--club-blanco)] dark:data-[state=active]:bg-[var(--club-amarillo)] dark:data-[state=active]:text-[var(--club-negro)]"
          >
            Subir archivo
          </TabsTrigger>
          <TabsTrigger 
            value="browse"
            disabled={!blobConfigured}
            className="data-[state=active]:bg-[var(--club-verde)] data-[state=active]:text-[var(--club-blanco)] dark:data-[state=active]:bg-[var(--club-amarillo)] dark:data-[state=active]:text-[var(--club-negro)]"
          >
            <FolderOpen className="mr-1 h-4 w-4" />
            Explorar
          </TabsTrigger>
          <TabsTrigger 
            value="url"
            className="data-[state=active]:bg-[var(--club-verde)] data-[state=active]:text-[var(--club-blanco)] dark:data-[state=active]:bg-[var(--club-amarillo)] dark:data-[state=active]:text-[var(--club-negro)]"
          >
            URL externa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="space-y-2">
            <Label>
              {acceptedTypes.includes('audio') ? 'Seleccionar archivo de audio' : 'Seleccionar imagen, GIF o video'}
            </Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo {maxSizeMB}MB. {acceptedTypes.includes('audio') ? 'Formatos: MP3, WAV, OGG' : 'Formatos: JPG, PNG, GIF, SVG, MP4, WebM'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-3">
          <div className="space-y-2">
            <Label>Seleccionar de archivos subidos anteriormente</Label>
            <BlobBrowser folder={folder} onSelect={handleBlobSelect} />
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="space-y-2">
            <Label>
              {acceptedTypes.includes('audio') ? 'URL externa de audio' : 'URL externa (imagen, GIF o video)'}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder={acceptedTypes.includes('audio') ? 'https://ejemplo.com/musica.mp3' : 'https://ejemplo.com/imagen.jpg o YouTube URL'}
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
              <Button 
                type="button"
                onClick={handleExternalUrl}
                disabled={!externalUrl}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Usar URL
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {acceptedTypes.includes('audio') 
                ? 'Acepta archivos MP3, WAV, OGG directos' 
                : 'También acepta enlaces de YouTube, Vimeo, etc.'}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {previewUrl && (
        <div className="relative border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Vista previa ({previewType})</span>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
            {previewType === 'audio' ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <audio src={previewUrl} controls className="w-full">
                  Tu navegador no soporta audio.
                </audio>
              </div>
            ) : previewType === 'video' || previewType === 'youtube' ? (
              (previewUrl.includes('youtube.com') || previewUrl.includes('youtu.be')) ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video preview"
                />
              ) : (
                <video src={previewUrl} controls className="w-full h-full object-contain">
                  Tu navegador no soporta video.
                </video>
              )
            ) : (
              <Image 
                src={previewUrl || "/placeholder.svg"} 
                alt="Preview" 
                fill 
                className="object-contain"
                unoptimized={previewType === 'gif'}
              />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground truncate">{previewUrl}</p>
        </div>
      )}
    </div>
  )
}
