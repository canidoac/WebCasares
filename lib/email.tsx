"use server"

export async function sendPasswordResetEmail(email: string, token: string, nombre: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/restablecer-contrasena?token=${token}`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - Club Carlos Casares</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <!-- Header con bandera -->
            <div style="background: linear-gradient(to bottom, #2e8b58 0%, #2e8b58 33.33%, #ffffff 33.33%, #ffffff 66.66%, #ffd700 66.66%, #ffd700 100%); padding: 40px 20px; text-align: center;">
                <img src="https://www.clubcarloscasares.com/images/logo-club.png" alt="Logo Club Carlos Casares" style="max-width: 120px; margin-bottom: 15px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));">
                <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Recuperación de Contraseña</h1>
            </div>

            <!-- Contenido -->
            <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
                <h2 style="color: #020817; font-size: 20px;">Hola, <strong>${nombre}</strong></h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el <strong>Club Carlos Casares</strong>. Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetUrl}" style="background-color: #2e8b58; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer mi contraseña</a>
                </div>

                <p>Este enlace expirará en las próximas <strong>24 horas</strong> por motivos de seguridad.</p>

                <div style="font-size: 12px; color: #888888; word-break: break-all; margin-top: 25px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                    Si tienes problemas con el botón, copia y pega este enlace en tu navegador: <br>
                    <a href="${resetUrl}" style="color: #2e8b58;">${resetUrl}</a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #020817; color: #ffffff; text-align: center; padding: 20px; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Club Carlos Casares. Todos los derechos reservados.<br>
                Este es un mensaje automático, por favor no respondas a este correo.
            </div>
        </div>
    </body>
    </html>
  `

  const textContent = `Hola ${nombre},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nHaz clic aquí: ${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste esto, ignora este email.`

  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = "no-reply@clubcarloscasares.com"

    if (!resendApiKey) {
      console.log("[v0] 📧 Email de recuperación simulado (RESEND_API_KEY no configurada):")
      console.log(`[v0] Para: ${email}`)
      console.log(`[v0] Enlace de recuperación: ${resetUrl}`)
      console.log(`[v0] Token: ${token}`)
      console.log("[v0] ⚠️ Configura RESEND_API_KEY para enviar emails reales")
      return {
        success: true,
        message: "Email simulado en desarrollo. Revisa la consola del servidor.",
        resetUrl,
      }
    }

    console.log("[v0] 📧 Enviando email de recuperación vía Resend...")
    console.log(`[v0] From: ${fromEmail}`)
    console.log(`[v0] To: ${email}`)

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "Restablece tu contraseña - Club Carlos Casares",
        html: htmlContent,
        text: textContent,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] ❌ Error de Resend:", data)
      throw new Error(data.message || "Error al enviar email")
    }

    console.log("[v0] ✅ Email enviado exitosamente a:", email)
    console.log("[v0] Resend ID:", data.id)

    return { success: true }
  } catch (error) {
    console.error("[v0] ❌ Error sending password reset email:", error)
    // En desarrollo, aún devolvemos éxito con el URL para testing
    if (!process.env.RESEND_API_KEY) {
      return {
        success: true,
        message: "Email simulado (RESEND_API_KEY no configurada en dev)",
        resetUrl,
      }
    }
    return { error: "Error al enviar el email de recuperación" }
  }
}

export async function sendVerificationEmail(email: string, token: string, nombre: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verificar-email?token=${token}`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta - Club Carlos Casares</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <!-- Header con bandera -->
            <div style="background: linear-gradient(to bottom, #2e8b58 0%, #2e8b58 33.33%, #ffffff 33.33%, #ffffff 66.66%, #ffd700 66.66%, #ffd700 100%); padding: 40px 20px; text-align: center;">
                <img src="https://www.clubcarloscasares.com/images/logo-club.png" alt="Logo Club Carlos Casares" style="max-width: 120px; margin-bottom: 15px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));">
                <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Bienvenido al Club</h1>
            </div>

            <!-- Contenido -->
            <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
                <h2 style="color: #020817; font-size: 20px;">Hola, <strong>${nombre}</strong></h2>
                <p>Gracias por registrarte en el <strong>Club Carlos Casares</strong>. Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email.</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${verificationUrl}" style="background-color: #2e8b58; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verificar mi cuenta</a>
                </div>

                <p>Este enlace expirará en las próximas <strong>24 horas</strong> por motivos de seguridad.</p>

                <div style="font-size: 12px; color: #888888; word-break: break-all; margin-top: 25px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                    Si tienes problemas con el botón, copia y pega este enlace en tu navegador: <br>
                    <a href="${verificationUrl}" style="color: #2e8b58;">${verificationUrl}</a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #020817; color: #ffffff; text-align: center; padding: 20px; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Club Carlos Casares. Todos los derechos reservados.<br>
                Este es un mensaje automático, por favor no respondas a este correo.
            </div>
        </div>
    </body>
    </html>
  `

  const textContent = `Hola ${nombre},\n\nGracias por registrarte en el Club Carlos Casares. Por favor verifica tu dirección de email haciendo clic aquí: ${verificationUrl}\n\nEste enlace expirará en 24 horas.\n\nSi no creaste esta cuenta, ignora este email.`

  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = "info@clubcarloscasares.com"

    if (!resendApiKey) {
      console.log("[v0] 📧 Email de verificación simulado (RESEND_API_KEY no configurada):")
      console.log(`[v0] Para: ${email}`)
      console.log(`[v0] Enlace de verificación: ${verificationUrl}`)
      console.log(`[v0] Token: ${token}`)
      return {
        success: true,
        message: "Email simulado en desarrollo. Revisa la consola del servidor.",
        verificationUrl,
      }
    }

    console.log("[v0] 📧 Enviando email de verificación vía Resend...")
    console.log(`[v0] From: ${fromEmail}`)
    console.log(`[v0] To: ${email}`)

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "Verifica tu cuenta - Club Carlos Casares",
        html: htmlContent,
        text: textContent,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] ❌ Error de Resend:", data)
      throw new Error(data.message || "Error al enviar email")
    }

    console.log("[v0] ✅ Email enviado exitosamente a:", email)
    console.log("[v0] Resend ID:", data.id)

    return { success: true }
  } catch (error) {
    console.error("[v0] ❌ Error sending verification email:", error)
    // En desarrollo, aún devolvemos éxito con el URL para testing
    if (!process.env.RESEND_API_KEY) {
      return {
        success: true,
        message: "Email simulado (RESEND_API_KEY no configurada en dev)",
        verificationUrl,
      }
    }
    return { error: "Error al enviar el email de verificación" }
  }
}
