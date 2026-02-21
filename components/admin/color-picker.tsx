"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Save } from 'lucide-react'
import { useState, useEffect } from "react"

interface ClubColor {
  name: string
  hex_value: string
  is_official: boolean
}

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export function ColorPicker({ value, onChange, label, placeholder }: ColorPickerProps) {
  const [clubColors, setClubColors] = useState<ClubColor[]>([
    { name: "Verde", hex_value: "#2e8b58", is_official: true },
    { name: "Amarillo", hex_value: "#ffd700", is_official: true },
    { name: "Blanco", hex_value: "#ffffff", is_official: true },
    { name: "Negro", hex_value: "#000000", is_official: true },
    { name: "Azul", hex_value: "#020817", is_official: true },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  useEffect(() => {
    fetch('/api/club-colors/official')
      .then(res => res.json())
      .then(data => {
        if (data.colors && data.colors.length > 0) {
          setClubColors(data.colors)
        }
      })
      .catch(err => console.error('[v0] Error loading club colors:', err))
  }, [])

  const handleSaveCustomColor = async () => {
    if (!tempValue || tempValue === value) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/club-colors/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hex_value: tempValue }),
      })
      
      if (response.ok) {
        onChange(tempValue)
      }
    } catch (error) {
      console.error('[v0] Error saving custom color:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-12 h-10 rounded border-2 border-muted cursor-pointer"
          title="Seleccionar color"
        />
        
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          placeholder={placeholder || "#2e8b58"}
          className="flex-1"
        />
        
        {tempValue !== value && (
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={handleSaveCustomColor}
            disabled={isSaving}
            title="Aplicar y guardar color"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Colores del Club</p>
              <div className="grid grid-cols-5 gap-2">
                {clubColors.filter(c => c.is_official).map((clubColor) => (
                  <button
                    key={clubColor.hex_value}
                    type="button"
                    onClick={() => {
                      setTempValue(clubColor.hex_value)
                      onChange(clubColor.hex_value)
                    }}
                    className="w-10 h-10 rounded border-2 border-muted hover:border-primary hover:scale-110 transition-all"
                    style={{ backgroundColor: clubColor.hex_value }}
                    title={clubColor.name}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
