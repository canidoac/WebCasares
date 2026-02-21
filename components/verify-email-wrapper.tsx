"use client"

import { Suspense } from "react"
import { VerifyEmailContent } from "@/components/verify-email-content"

function VerifyEmailWithParams() {
  return <VerifyEmailContent />
}

export function VerifyEmailWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando verificación...</div>}>
      <VerifyEmailWithParams />
    </Suspense>
  )
}
