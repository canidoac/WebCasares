# Club Carlos Casares

Sitio oficial del Club Carlos Casares.

## Requisitos para desarrollo

- Node.js 18 o superior
- npm o yarn

## Instalación

\`\`\`bash
# Instalar dependencias
npm install
# o
yarn install
\`\`\`

## Desarrollo

\`\`\`bash
# Iniciar servidor de desarrollo
npm run dev
# o
yarn dev
\`\`\`

## Construcción para producción y despliegue en Ferozo

\`\`\`bash
# Construir para producción
npm run deploy
\`\`\`

Este comando generará una carpeta `out` con todos los archivos necesarios para desplegar en Ferozo.

## Instrucciones para despliegue en Ferozo

1. Ejecuta `npm run deploy` para generar los archivos estáticos
2. Sube **todo el contenido** de la carpeta `out` a la carpeta `public_html` de tu hosting Ferozo
3. Asegúrate de subir también el archivo `.htaccess`

Para instrucciones más detalladas, consulta el archivo `FEROZO-DEPLOY.md`.

## Estructura de archivos

- `app/`: Contiene las páginas y componentes de la aplicación Next.js
- `components/`: Componentes reutilizables
- `context/`: Contextos de React para estado global
- `lib/`: Utilidades y funciones auxiliares
- `public/`: Archivos estáticos (imágenes, etc.)

## Notas importantes

- Este sitio está configurado para funcionar como un sitio estático en Ferozo
- Todas las funcionalidades se ejecutan en el navegador del cliente
- Para cualquier cambio, deberás reconstruir el sitio y volver a subir los archivos
