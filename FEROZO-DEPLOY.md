# Guía de despliegue en Ferozo

Esta guía te ayudará a desplegar correctamente el sitio web del Club Carlos Casares en Ferozo.

## Preparación de archivos

1. Ejecuta `npm run build` para construir la aplicación
2. Todos los archivos estáticos se generarán en la carpeta `out`

## Pasos para subir a Ferozo

1. Accede al Panel de Control de Ferozo
2. Ve a la sección "Administrador de Archivos" o utiliza FTP
3. Sube **todo el contenido** de la carpeta `out` a la carpeta `public_html` (o la carpeta raíz de tu dominio)
4. Asegúrate de subir también el archivo `.htaccess`

## Estructura de archivos

Asegúrate de que la estructura en Ferozo sea:

\`\`\`
public_html/
├── .htaccess
├── index.html
├── _next/
│   └── ... (archivos estáticos)
├── tienda/
│   └── index.html
└── ... (otros archivos y carpetas)
\`\`\`

## Solución de problemas comunes en Ferozo

### Error 500 Internal Server Error

Si recibes este error, verifica:

1. El archivo `.htaccess` - Ferozo puede tener restricciones específicas
2. Contacta al soporte de Ferozo para verificar si hay alguna configuración especial necesaria

### Las imágenes o estilos no cargan

1. Verifica que todos los archivos de la carpeta `_next` se hayan subido correctamente
2. Asegúrate de que los permisos de archivos sean correctos (generalmente 644 para archivos y 755 para carpetas)

### Problemas con rutas o navegación

1. Verifica que el archivo `.htaccess` se haya subido correctamente
2. Asegúrate de que la opción `trailingSlash: true` esté configurada en `next.config.mjs`

## Contacto para soporte

Si continúas teniendo problemas, contacta al desarrollador o al soporte de Ferozo.
\`\`\`

Ahora, vamos a eliminar archivos innecesarios:

\`\`\`typescriptreact file="index.js" isDeleted="true"
...deleted...
