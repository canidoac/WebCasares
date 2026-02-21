import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Info } from "lucide-react"
import { ProductOptionsProvider } from "@/context/product-options-context"
import { getUser } from "@/lib/auth"
import { getNavbarItems, getPublicSiteConfig } from "@/lib/site-config"
import { SiteBanner } from "@/components/site-banner"

// Datos actualizados para los productos con imágenes reales
const products = [
  {
    id: "camiseta-gris-f11-2025",
    name: "Camiseta Gris F11 2025",
    price: 22000,
    imageFront: "/images/products/camiseta-gris-frente.png",
    imageBack: "/images/products/camiseta-gris-dorso.png",
    badge: "Nueva",
    description:
      "Nueva Camiseta oficial de F11 para la temporada 2025. Diseño moderno en color gris con detalles en los colores del club.",
    inStock: true,
  },
  {
    id: "camiseta-f5-femenino-2025",
    name: "Camiseta F5 Femenino 2025",
    price: 22000,
    imageFront: "/images/products/camiseta-f5-femenino-frente.png",
    imageBack: "/images/products/camiseta-f5-femenino-dorso.png",
    badge: "Nueva",
    description: "Camiseta oficial del equipo femenino del Club para la temporada 2025.",
    inStock: true,
  },
  {
    id: "camiseta-roja-aviador",
    name: "Camiseta Arquero Malatini",
    price: 22000,
    imageFront: "/images/products/camiseta-roja-frente.png",
    imageBack: "/images/products/camiseta-roja-dorso.png",
    badge: "Edición Especial",
    description:
      "Camiseta de arquero con un diseño único en degradé rojo a negro en homenaje al Piloto Acrobático de Avión Casarense Jorge Malatini.",
    inStock: true,
  },
  {
    id: "camiseta-arquero-mouras-amarilla",
    name: "Camiseta Arquero Mouras Amarilla",
    price: 22000,
    imageFront: "/images/products/camiseta-amarilla-frente.png",
    imageBack: "/images/products/camiseta-amarilla-dorso.png",
    badge: "Edición Especial",
    description:
      "Camiseta de arquero en color amarillo con diseño moderno en homenaje al deportista N1 de la ciudad Roberto Mouras.",
    inStock: true,
  },
  {
    id: "camiseta-negra-edicion-especial",
    name: "Camiseta Arquero Mouras Neg/Dor",
    price: 22000,
    imageFront: "/images/products/camiseta-negra-dorada-frente.png",
    imageBack: "/images/products/camiseta-negra-dorada-dorso.png",
    badge: "Edición Especial",
    description:
      "Camiseta de arquero en color negro con detalles dorados. Homenaje al deportista N1 de la ciudad Roberto Mouras.",
    inStock: true,
  },
  {
    id: "camiseta-blanca-quales",
    name: "Camiseta Blanca F11 2024",
    price: 22000,
    imageFront: "/images/products/camiseta-blanca-frente.png",
    imageBack: "/images/products/camiseta-blanca-dorso.png",
    description: "Camiseta F11 temporada 2024/2025.",
    inStock: true,
  },
  {
    id: "camiseta-verde-rayada",
    name: "Camiseta Titular F9",
    price: 22000,
    imageFront: "/images/products/camiseta-verde-frente.png",
    imageBack: "/images/products/camiseta-verde-dorso.png",
    description: "Camiseta titular fútbol 9. Diseño a rayas verticales verdes y blancas con detalles en amarillo.",
    inStock: true,
  },
  {
    id: "vaso-ccc-plastico",
    name: "Vaso CCC Plastico 500cc",
    price: 5000,
    imageFront: "/images/products/vaso-gris.png",
    is3D: true,
    render3DURL:
      "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836569693.jpg&tipo=copo&id_cor_tampa=&time=1746836569693",
    description:
      "Vaso oficial del Club Carlos Casares con capacidad de 500cc. Fabricado en plástico resistente y reutilizable, ideal para eventos deportivos y celebraciones.",
    inStock: false,
    variants: [
      {
        id: "gris",
        name: "Transparente",
        image: "/images/products/vaso-gris.png",
        color: "transparent",
        border: true,
        render3DURL:
          "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836643851.png&tipo=copo&id_cor_tampa=&time=1746836643851&id_tipo=1",
      },
      {
        id: "blanco",
        name: "Blanco",
        image: "/images/products/vaso-blanco.png",
        color: "white",
        border: true,
        render3DURL:
          "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836705143.jpg&tipo=copo&id_cor_tampa=&time=1746836705143",
      },
      {
        id: "negro",
        name: "Negro",
        image: "/images/products/vaso-negro.png",
        color: "black",
        border: false,
        render3DURL:
          "https://ecovasos.com/qero/customizer/?medida=2&ferramenta=1746836569693.jpg&tipo=copo&id_cor_tampa=&time=1746836569693",
      },
    ],
  },
]

export default async function TiendaPage() {
  const user = await getUser()
  const navbarItems = await getNavbarItems()
  const config = await getPublicSiteConfig()

  return (
    <div className="flex min-h-screen flex-col">
      {config.show_header_banner && config.header_banner_text && (
        <SiteBanner
          text={config.header_banner_text}
          link={config.header_banner_link}
          color={config.header_banner_color}
          textColor={config.header_banner_text_color}
        />
      )}

      <Navbar user={user} navbarItems={navbarItems} />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container py-8 md:py-12">
          <div className="bg-white dark:bg-gray-800 border-l-4 border-club-green dark:border-club-yellow rounded-md shadow-md p-4 mb-8 flex items-start gap-3">
            <div className="text-club-green dark:text-club-yellow mt-0.5">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Tienda Oficial</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Todos los pedidos tienen un tiempo de producción de aproximadamente entre{" "}
                <span className="font-medium">25 y 35 días</span>. Gracias por tu paciencia y comprensión.
              </p>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md mt-2 text-sm border border-yellow-200 dark:border-yellow-800">
                La tienda Oficial del club solo esta disponible por tiempo determinado
              </div>
            </div>
          </div>

          <ProductOptionsProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageFront={product.imageFront}
                  imageBack={product.imageBack}
                  badge={product.badge}
                  is3D={product.is3D}
                  render3DURL={product.render3DURL}
                  inStock={product.inStock}
                  description={product.description}
                  variants={product.variants}
                />
              ))}
            </div>
          </ProductOptionsProvider>
        </div>
      </main>
      <Footer user={user} />
    </div>
  )
}
