import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import { LoginForm } from "@/components/login-form"

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (userSession) {
    try {
      const user = JSON.parse(userSession.value)
      // Si ya está autenticado y es admin, redirigir al panel
      if (user.rolId === "55") {
        redirect("/admin/configuracion")
      } else {
        // No es admin, no debería estar aquí
        redirect("/")
      }
    } catch {
      // Cookie corrupta, continuar con login
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1a472a] mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 15v2" />
              <path d="M12 2v6" />
              <rect width="18" height="12" x="3" y="10" rx="2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Acceso de Administrador</h1>
          <p className="text-slate-400">Ingresa tus credenciales para acceder al panel</p>
        </div>
        
        <LoginForm redirectPath="/admin/configuracion" registrationEnabled={false} />
      </div>
    </div>
  )
}
