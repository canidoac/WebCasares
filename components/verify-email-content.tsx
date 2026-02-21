"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyEmail } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Token inválido")
        return
      }

      const result = await verifyEmail(token)

      if (result.error) {
        setStatus("error")
        setMessage(result.error)
      } else {
        setStatus("success")
        setMessage("¡Tu email ha sido verificado exitosamente!")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 3000)
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verificación de Email</CardTitle>
          <CardDescription>Estamos verificando tu dirección de email</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-club-green" />
              <p className="text-center text-muted-foreground">Verificando tu email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="font-medium text-green-700 dark:text-green-400">{message}</p>
                <p className="text-sm text-muted-foreground mt-2">Redirigiendo al inicio...</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <XCircle className="h-12 w-12 text-red-500" />
              <div className="text-center space-y-4">
                <p className="font-medium text-red-700 dark:text-red-400">{message}</p>
                <Link href="/">
                  <Button>Volver al inicio</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
