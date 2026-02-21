"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function MigracionesPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const runMigration = async () => {
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/setup/run-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: "013_create_password_reset_tokens" }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Migración ejecutada exitosamente")
      } else {
        setStatus("error")
        setMessage(data.error || "Error ejecutando la migración")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error de conexión al ejecutar la migración")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Migraciones de Base de Datos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Crear tabla PasswordResetTokens</CardTitle>
          <CardDescription>
            Esta migración crea la tabla necesaria para el sistema de recuperación de contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-mono">Script: 013_create_password_reset_tokens.sql</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crea la tabla PasswordResetTokens con los campos: id, user_id, token, expires_at, used, created_at
            </p>
          </div>

          {status === "success" && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button onClick={runMigration} disabled={status === "loading" || status === "success"}>
            {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "success" ? "Migración Completada" : "Ejecutar Migración"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instrucciones Manuales (Alternativa)</CardTitle>
          <CardDescription>Si prefieres ejecutar el script manualmente en Supabase:</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abre tu proyecto en el Dashboard de Supabase</li>
            <li>Ve a la sección &quot;SQL Editor&quot;</li>
            <li>Crea una nueva query</li>
            <li>Copia y pega el siguiente SQL:</li>
          </ol>

          <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto text-xs">
            {`-- Tabla para tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON "PasswordResetTokens"(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON "PasswordResetTokens"(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON "PasswordResetTokens"(expires_at);`}
          </pre>

          <ol className="list-decimal list-inside space-y-2 text-sm mt-4" start={5}>
            <li>Ejecuta el script haciendo clic en &quot;Run&quot; o presionando Cmd/Ctrl + Enter</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
