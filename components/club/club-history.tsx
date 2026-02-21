"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface ClubHistoryProps {
  content?: string
  imageUrl?: string
}

export function ClubHistory({ content, imageUrl }: ClubHistoryProps) {
  if (!content) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            La información del club no está disponible en este momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  const paragraphs = content.split('\n\n').filter(p => p.trim())

  return (
    <div className="grid gap-8 lg:gap-12">
      {imageUrl && (
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Historia del club"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-foreground/90 leading-relaxed mb-6">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
