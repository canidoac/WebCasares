# Configuración de Envío de Emails con Resend

Tu aplicación ahora usa **Resend** para enviar emails reales de recuperación de contraseña y verificación de cuenta.

## Estado Actual

✅ **El código está configurado para funcionar inmediatamente** usando `onboarding@resend.dev`, un dominio pre-verificado por Resend.

Solo necesitas agregar tu `RESEND_API_KEY` y los emails comenzarán a enviarse.

## ¿Por qué Resend?

- ✅ Funciona perfectamente en Vercel
- ✅ API simple y moderna
- ✅ Plan gratuito generoso (3,000 emails/mes, 100 emails/día)
- ✅ Sin necesidad de configuración SMTP compleja
- ✅ `onboarding@resend.dev` pre-verificado (sin configuración de DNS)

## Configuración en 3 pasos:

### 1. Crear cuenta en Resend

1. Ve a https://resend.com
2. Regístrate gratis (3,000 emails/mes incluidos)
3. Verifica tu email

### 2. Obtener API Key

1. En el dashboard de Resend, ve a "API Keys"
2. Haz clic en "Create API Key"
3. Dale un nombre (ej: "Club Carlos Casares Production")
4. Copia la API key (empieza con `re_`)

### 3. Configurar en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

\`\`\`
RESEND_API_KEY=re_tu_api_key_aqui
\`\`\`

¡Listo! Los emails comenzarán a enviarse desde `onboarding@resend.dev`.

## Para Producción: Dominio personalizado (Opcional)

Si quieres enviar desde `no-reply@clubcarloscasares.com` en lugar de `onboarding@resend.dev`:

### 1. Verificar tu dominio en Resend

1. En Resend dashboard, ve a "Domains"
2. Haz clic en "Add Domain"
3. Ingresa tu dominio: `clubcarloscasares.com`
4. Sigue las instrucciones para agregar los registros DNS:
   - **SPF**: TXT record para verificar tu dominio
   - **DKIM**: TXT record para autenticación de emails
   - **MX** (opcional): Para recibir bounces

### 2. Actualizar el código

Una vez que tu dominio esté verificado en Resend, actualiza `lib/email.tsx`:

\`\`\`typescript
// Cambiar esta línea:
const fromEmail = "onboarding@resend.dev"

// Por:
const fromEmail = "no-reply@clubcarloscasares.com"
\`\`\`

## Testing en desarrollo

Sin `RESEND_API_KEY`, los emails se simulan y el enlace aparece en la consola:

\`\`\`
[v0] 📧 Email de recuperación simulado
[v0] Para: usuario@example.com
[v0] Enlace de recuperación: http://localhost:3000/restablecer-contrasena?token=abc123
\`\`\`

## Verificación

Después de configurar `RESEND_API_KEY`, prueba:

1. Ir a `/olvidaste-contrasena`
2. Ingresar un email registrado
3. Revisar los logs de Vercel para confirmar el envío
4. Buscar el email en la bandeja de entrada

Si ves `✅ Email enviado exitosamente` y un `Resend ID` en los logs, el email se envió correctamente.

⚠️ **Nota sobre SPAM**: Los emails desde `onboarding@resend.dev` pueden ir a la carpeta de spam en algunos proveedores. Esto es normal para dominios de testing. Para mejor deliverability, verifica tu propio dominio.

## Solución de problemas

### Error 403: Domain not verified

Este error ya está resuelto. El código usa `onboarding@resend.dev` que está pre-verificado.

### Emails no llegan

1. Verifica que `RESEND_API_KEY` esté configurada correctamente
2. Revisa los logs del servidor para ver si hay errores
3. Busca en la carpeta de spam
4. Verifica en el dashboard de Resend si el email aparece como enviado
</parameter>
