# Configuración de Email con DonWeb

Para configurar el envío de emails con tu cuenta de DonWeb, necesitas agregar las siguientes **variables de entorno** en Vercel:

## Variables Requeridas

### 1. SMTP_HOST
El servidor SMTP de DonWeb. Normalmente es uno de estos:
- `smtp.donweb.com`
- `mail.tudominio.com` (si tienes dominio propio)

**Cómo obtenerlo:** Busca en el panel de DonWeb en la sección de "Configuración de Email" o "Cuentas de correo"

### 2. SMTP_PORT
El puerto del servidor SMTP:
- `465` para SSL (recomendado)
- `587` para TLS
- `25` para conexión no segura (no recomendado)

### 3. SMTP_SECURE
Usa `true` para SSL (puerto 465) o `false` para TLS (puerto 587)
- Si usas puerto `465`: pon `true`
- Si usas puerto `587`: pon `false`

### 4. SMTP_USER
Tu dirección de email completa de DonWeb
Ejemplo: `info@clubcarloscasares.com` o `tu-email@donweb.com`

### 5. SMTP_PASSWORD
La contraseña de tu cuenta de email de DonWeb (la misma que usas para entrar al webmail)

### 6. NEXT_PUBLIC_APP_URL
La URL de tu sitio en producción
Ejemplo: `https://tu-sitio.vercel.app`

---

## Cómo Agregar en Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en "Settings" (Configuración)
3. Selecciona "Environment Variables"
4. Agrega cada variable con su valor correspondiente
5. Haz un nuevo deploy para que los cambios surtan efecto

---

## Ejemplo de Configuración

\`\`\`
SMTP_HOST=smtp.donweb.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@clubcarloscasares.com
SMTP_PASSWORD=tu_contraseña_segura
NEXT_PUBLIC_APP_URL=https://clubcarloscasares.vercel.app
\`\`\`

---

## Datos de DonWeb

Si no encuentras los datos SMTP en tu panel de DonWeb:

1. Ingresa al panel de control de DonWeb
2. Busca la sección "Email" o "Cuentas de correo"
3. Busca "Configuración SMTP" o "Datos del servidor"
4. También puedes contactar al soporte de DonWeb para que te den los datos exactos

**Soporte DonWeb:** https://www.donweb.com/es-ar/soporte

---

## Probar la Configuración

Una vez configuradas las variables:
1. Haz un nuevo deploy en Vercel
2. Ve a `/olvidaste-contrasena` en tu sitio
3. Ingresa un email de prueba
4. Deberías recibir el email de recuperación

Si no funciona, revisa los logs en Vercel para ver el error específico.
