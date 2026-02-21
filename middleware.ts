import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Rutas que requieren autenticación
const protectedRoutes = ["/perfil"]

const adminRoutes = ["/admin"]

// Rutas que solo pueden acceder usuarios no autenticados
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const userSession = request.cookies.get("user_session")
  const isAuthenticated = !!userSession

  const { pathname } = request.nextUrl

  let user = null
  if (userSession) {
    try {
      user = JSON.parse(userSession.value)
    } catch {
      user = null
    }
  }

  const isAdminOrDev = user && (user.rolId === "55" || user.rolId === 55 || user.rolId === "56" || user.rolId === 56)

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      })

      // Obtener configuración del sitio (una sola fila con id=1)
      const { data: configArray } = await supabase
        .from("SiteConfig")
        .select("active_status_id")
        .eq("id", 1)
        .limit(1)
      
      const config = configArray?.[0]

      if (config?.active_status_id) {
        const { data: status } = await supabase
          .from("SiteStatus")
          .select("status_key")
          .eq("id", config.active_status_id)
          .single()

        if (status) {
          if (isAdminOrDev) {
            // Los admins y devs no son redirigidos a maintenance o coming-soon
            // Continuar con las validaciones normales de autenticación
          } else {
            // Si el sitio está en mantenimiento
            if (status.status_key === "maintenance") {
              if (!pathname.startsWith("/admin/login") && pathname !== "/maintenance") {
                return NextResponse.redirect(new URL("/maintenance", request.url))
              }
            }

            // Si el sitio está en "coming soon"
            if (status.status_key === "coming_soon") {
              // Permitir acceso solo a /login, /register y /coming-soon
              if (
                pathname !== "/coming-soon" &&
                !pathname.startsWith("/login") &&
                !pathname.startsWith("/register") &&
                !pathname.startsWith("/admin/login")
              ) {
                return NextResponse.redirect(new URL("/coming-soon", request.url))
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[v0] Middleware - Error checking site status:", error)
  }

  // Si el usuario está autenticado y trata de acceder a login/register
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (pathname === "/admin/login") {
      // Si ya está autenticado, verificar rol
      if (isAuthenticated && user?.rolId !== "55") {
        return NextResponse.redirect(new URL("/", request.url))
      }
      // Si no está autenticado, dejar pasar para que pueda loguearse
      return NextResponse.next()
    }
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    if (user?.rolId !== "55") {
      // Not an admin, redirect to home
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Si el usuario no está autenticado y trata de acceder a rutas protegidas
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)",
  ],
}
