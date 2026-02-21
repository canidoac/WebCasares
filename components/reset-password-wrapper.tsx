"use client"

import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/reset-password-form"

function ResetPasswordFormWithParams() {
  return <ResetPasswordForm />
}

export function ResetPasswordWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando formulario...</div>}>
      <ResetPasswordFormWithParams />
    </Suspense>
  )
}
