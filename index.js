// Archivo index.js simplificado para evitar errores de inicialización
// Este archivo sirve como punto de entrada para hosts tradicionales

// Información básica del proyecto
const clubInfo = {
  name: "Club Carlos Casares",
  version: "1.0.0",
  description: "Sitio oficial del Club Carlos Casares",
}

// Exportar información básica
if (typeof module !== "undefined" && module.exports) {
  module.exports = clubInfo
}

// Redirigir a la aplicación Next.js si estamos en el navegador
if (typeof window !== "undefined") {
  // Usar setTimeout para evitar problemas con la ejecución inmediata
  setTimeout(() => {
    window.location.href = "/app"
  }, 100)
}
