# Configuración de Email Actualizada

He actualizado el sistema de emails para que funcione correctamente en el entorno de v0 y en producción.

## 🔧 Cómo funciona ahora

### En Desarrollo (v0 Preview)
- Los emails se **simulan** y no se envían realmente
- El enlace de recuperación/verificación se muestra en la **consola del servidor**
- Puedes copiar el enlace directamente desde los logs para probar la funcionalidad

### En Producción (Vercel)
Tienes dos opciones para enviar emails reales:

#### Opción 1: Resend (Recomendado para v0)
Resend es un servicio de emails que funciona perfectamente con Next.js y v0.

1. Crea una cuenta gratuita en [resend.com](https://resend.com)
2. Obtén tu API key
3. Agrega esta variable de entorno en Vercel:
   - `RESEND_API_KEY`: Tu API key de Resend
   - `SMTP_USER`: El email desde el que se enviarán los correos

**Ventajas:**
- ✅ 100 emails gratis al día
- ✅ Fácil configuración
- ✅ Compatible con v0
- ✅ Incluye analytics

#### Opción 2: SMTP de DonWeb (Para producción avanzada)
Si prefieres usar tu servidor SMTP de DonWeb, necesitarás configurar un proxy o edge function ya que SMTP no funciona directamente en el entorno de Next.js Edge Runtime.

## 📝 Variables de Entorno Necesarias

Para producción con Resend:
\`\`\`
RESEND_API_KEY=re_xxxxxxxxxx
SMTP_USER=noreply@tudominio.com
NEXT_PUBLIC_APP_URL=https://tudominio.com
\`\`\`

## 🧪 Testing en Desarrollo

Cuando solicites recuperar contraseña en v0:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña de logs del servidor
3. Verás el enlace de recuperación impreso en los logs
4. Copia y pega ese enlace en el navegador para probar

Ejemplo de lo que verás:
\`\`\`
[v0] 📧 Email de recuperación simulado:
[v0] Para: usuario@ejemplo.com
[v0] Enlace de recuperación: http://localhost:3000/restablecer-contrasena?token=abc123
[v0] Token: abc123
\`\`\`

## 🚀 Para ir a Producción

1. Registra tu dominio en Resend
2. Agrega las variables de entorno en Vercel
3. Despliega tu app
4. ¡Los emails se enviarán automáticamente!
