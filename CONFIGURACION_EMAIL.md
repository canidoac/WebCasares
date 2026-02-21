# Configuración de Email con DonWeb

Para que el sistema de recuperación de contraseña funcione, necesitas configurar las siguientes **variables de entorno** en tu proyecto de Vercel:

## Variables de Entorno Requeridas

### 1. GMAIL_USER
Tu dirección de email de DonWeb (ej: `tucuenta@tudominio.com`)

### 2. GMAIL_APP_PASSWORD
Contraseña de aplicación de Gmail. Si usas DonWeb con Gmail:
- Ve a tu cuenta de Google
- Seguridad → Verificación en 2 pasos (debes activarla primero)
- Contraseñas de aplicaciones
- Genera una nueva contraseña para "Mail"
- Copia la contraseña de 16 caracteres

**Si DonWeb NO usa Gmail:**
Necesitarás configurar SMTP personalizado. Contacta a DonWeb para obtener:
- Servidor SMTP (ej: `mail.tudominio.com`)
- Puerto (usualmente 587 o 465)
- Usuario SMTP
- Contraseña SMTP

### 3. NEXT_PUBLIC_APP_URL
La URL de tu aplicación en producción (ej: `https://tu-sitio.vercel.app`)

## Cómo agregar las variables en Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en "Settings" → "Environment Variables"
3. Agrega cada variable:
   - **Name**: `GMAIL_USER`
   - **Value**: tu email de DonWeb
   - Environment: Marca Production, Preview y Development
   
4. Repite para `GMAIL_APP_PASSWORD` y `NEXT_PUBLIC_APP_URL`
5. Redeploya tu aplicación

## Alternativa: Configuración SMTP Personalizada (si no usas Gmail)

Si tu email de DonWeb no funciona con la configuración de Gmail, edita `lib/email.tsx` y reemplaza:

\`\`\`typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ej: mail.tudominio.com
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true para puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})
\`\`\`

Y agrega las variables:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

## Verificación

Una vez configurado:
1. Ve a `/olvidaste-contrasena`
2. Ingresa un email registrado
3. Deberías recibir un email con el enlace de recuperación

## Solución de Problemas

- **No llega el email**: Verifica que las credenciales sean correctas
- **Error de autenticación**: Asegúrate de usar una contraseña de aplicación, no tu contraseña normal
- **Email en spam**: Configura SPF y DKIM en DonWeb para mejorar la entregabilidad
