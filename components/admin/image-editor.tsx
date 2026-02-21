"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Check, X, Crop, Move } from 'lucide-react'

interface ImageEditorProps {
  imageUrl: string
  onSave: (croppedImageUrl: string, file: File) => void
  onCancel: () => void
  recommendedSize?: { width: number; height: number; label: string }
}

export function ImageEditor({ imageUrl, onSave, onCancel, recommendedSize }: ImageEditorProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mode, setMode] = useState<"move" | "crop">("move")

  const [cropArea, setCropArea] = useState({ x: 100, y: 100, width: 400, height: 300 })
  const [isCropping, setIsCropping] = useState(false)
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === "crop") return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === "move" && isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsCropping(false)
  }

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCropping(true)
    setCropDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y,
    })
  }

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(e.clientX - cropDragStart.x, rect.width - cropArea.width))
    const newY = Math.max(0, Math.min(e.clientY - cropDragStart.y, rect.height - cropArea.height))

    setCropArea({ ...cropArea, x: newX, y: newY })
  }

  const handleSave = async () => {
    try {
      console.log("[v0] Starting image save process...")

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx || !containerRef.current || !imageRef.current) return

      const img = new window.Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        if (mode === "crop") {
          const imgElement = imageRef.current
          if (!imgElement) return

          const imgRect = imgElement.getBoundingClientRect()
          const containerRect = containerRef.current!.getBoundingClientRect()

          const cropXRelative = cropArea.x - (imgRect.left - containerRect.left)
          const cropYRelative = cropArea.y - (imgRect.top - containerRect.top)

          const scaleX = img.naturalWidth / imgRect.width
          const scaleY = img.naturalHeight / imgRect.height

          const finalCropX = Math.max(0, cropXRelative * scaleX)
          const finalCropY = Math.max(0, cropYRelative * scaleY)
          const finalCropWidth = Math.min(cropArea.width * scaleX, img.naturalWidth - finalCropX)
          const finalCropHeight = Math.min(cropArea.height * scaleY, img.naturalHeight - finalCropY)

          console.log("[v0] Crop calculation:", {
            imgRect: { width: imgRect.width, height: imgRect.height },
            naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
            scale: { x: scaleX, y: scaleY },
            cropArea,
            cropRelative: { x: cropXRelative, y: cropYRelative },
            finalCrop: { x: finalCropX, y: finalCropY, w: finalCropWidth, h: finalCropHeight },
          })

          canvas.width = finalCropWidth
          canvas.height = finalCropHeight

          ctx.drawImage(
            img,
            finalCropX,
            finalCropY,
            finalCropWidth,
            finalCropHeight,
            0,
            0,
            finalCropWidth,
            finalCropHeight,
          )

          console.log("[v0] Crop applied successfully")
        } else {
          const maxSize = 1200
          const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1)

          canvas.width = img.naturalWidth * scale
          canvas.height = img.naturalHeight * scale

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          console.log("[v0] Image resized to:", canvas.width, "x", canvas.height)
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const timestamp = Date.now()
              const randomSuffix = Math.random().toString(36).substring(2, 8)
              const fileName = `edited-${timestamp}-${randomSuffix}.jpg`

              const file = new File([blob], fileName, { type: "image/jpeg" })
              const url = URL.createObjectURL(blob)

              console.log("[v0] Image processed successfully, calling onSave with filename:", fileName)
              onSave(url, file)
            }
          },
          "image/jpeg",
          0.92,
        )
      }

      img.onerror = (error) => {
        console.error("[v0] Error loading image:", error)
        alert("Error al cargar la imagen. Por favor intenta de nuevo.")
      }

      img.src = imageUrl
    } catch (error) {
      console.error("[v0] Error al procesar imagen:", error)
      alert("Error al procesar la imagen. Por favor intenta de nuevo.")
    }
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-muted/50 p-4 flex justify-between items-center border-b">
        <div>
          <h3 className="font-semibold">Editar Imagen</h3>
          {recommendedSize && (
            <p className="text-muted-foreground text-xs mt-1">
              Tamaño recomendado: {recommendedSize.width}x{recommendedSize.height}px ({recommendedSize.label})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Guardar y Cargar
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 p-2 flex justify-center gap-2 border-b">
        <Button size="sm" variant={mode === "move" ? "default" : "outline"} onClick={() => setMode("move")}>
          <Move className="h-4 w-4 mr-1" />
          Mover
        </Button>
        <Button size="sm" variant={mode === "crop" ? "default" : "outline"} onClick={() => setMode("crop")}>
          <Crop className="h-4 w-4 mr-1" />
          Recortar
        </Button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-move bg-muted/20"
        onMouseDown={handleMouseDown}
        onMouseMove={mode === "crop" ? handleCropMouseMove : handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.1s",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            ref={imageRef}
            src={imageUrl || "/placeholder.svg"}
            alt="Editar"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>

        {mode === "crop" && (
          <div
            className="absolute border-2 border-primary shadow-lg cursor-move"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
              boxShadow: "0 0 0 9999px hsl(var(--background) / 0.7)",
            }}
            onMouseDown={handleCropMouseDown}
          >
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-primary/30" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/50 p-4 flex items-center justify-center gap-4 border-t">
        <ZoomOut className="h-5 w-5" />
        <Slider
          value={[zoom]}
          onValueChange={([value]) => setZoom(value)}
          min={0.5}
          max={3}
          step={0.1}
          className="w-64"
        />
        <ZoomIn className="h-5 w-5" />
        <span className="text-sm ml-2">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
