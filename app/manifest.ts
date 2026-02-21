import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Club Carlos Casares",
    short_name: "CCC",
    description: "Sitio oficial del Club Carlos Casares",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2E8B57",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
