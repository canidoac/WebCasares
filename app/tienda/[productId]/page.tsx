"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, RotateCcw, Eye, ShoppingBag, Plus, Minus, Ruler, X, AlertTriangle, Check } from "lucide-react"
import { Tooltip } from "@/components/tooltip"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { SiteBanner } from "@/components/site-banner"

// Datos actualizados para los productos con imágenes reales
const products = [
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
    id: "camiseta-verde-rayada",
    name: "Camiseta Titular F9",
    price: 22000,
    imageFront: "/images/products/camiseta-verde-frente.png",
    imageBack: "/images/products/camiseta-verde-dorso.png",
    description: "Camiseta titular fútbol 9. Diseño a rayas verticales verdes y blancas con detalles en amarillo.",
    inStock: true,
  },
]

export default function ProductPage({ params }: { params: { productId: string } }) {
  const [showBack, setShowBack] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [withNumber, setWithNumber] = useState(false)
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [user, setUser] = useState<{ nombre: string; apellido: string; email: string } | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null) // Declared the variable here
  const product = products.find((p) => p.id === params.productId)

  // Usar el contexto del carrito
  const { addItem } = useCart()

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))

    fetch("/api/site-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setConfig(data))
      .catch(() => setConfig(null))
  }, [])

  const toggleView = () => {
    setShowBack(!showBack)
  }

  const toggleSizeGuide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSizeGuide(!showSizeGuide)
  }

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const getBadgeTooltip = (badge: string) => {
    if (badge === "Nueva") return "Modelo nuevo, Lanzamiento oficial"
    if (badge === "Edición Especial") return "Edición Homenaje Casarense"
    return ""
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Solo permitir números y limitar a 2 dígitos
    if (/^\d{0,2}$/.test(value)) {
      setJerseyNumber(value)
    }
  }

  const addToCart = () => {
    if ((!selectedSize && product?.id !== "vaso-ccc-plastico") || !product?.inStock) return

    // Obtener la variante seleccionada si existe
    const currentVariant = product.variants?.find((v) => v.id === selectedVariant)

    // Crear el objeto del item para el carrito
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: currentVariant?.image || product.imageFront,
      quantity,
      size: product.id === "vaso-ccc-plastico" ? undefined : selectedSize || undefined,
      color: currentVariant?.name,
      number: withNumber ? jerseyNumber : undefined,
    }

    // Añadir al carrito
    addItem(cartItem)
  }

  // Función para formatear la descripción con nombres resaltados
  const formatDescription = (text: string) => {
    if (!text) return null

    // Reemplazar Jorge Malatini con span resaltado
    const textWithMalatini = text.replace(
      /Jorge Malatini/g,
      '<span class="text-club-green dark:text-club-yellow font-medium">Jorge Malatini</span>',
    )

    // Reemplazar Roberto Mouras con span resaltado
    const formattedText = textWithMalatini.replace(
      /Roberto Mouras/g,
      '<span class="text-club-green dark:text-club-yellow font-medium">Roberto Mouras</span>',
    )

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />
  }

  const sizes = ["16", "S", "M", "L", "XL", "XXL"]

  // Ajuste especial para la camiseta de Malatini
  const isSpecialProduct = product?.id === "camiseta-roja-aviador"
  const imageScale = isSpecialProduct ? "scale-[0.85]" : "scale-[0.95]"

  // Obtener la imagen actual según la variante seleccionada
  const getCurrentImage = () => {
    if (product?.variants && selectedVariant) {
      const variant = product.variants.find((v) => v.id === selectedVariant)
      return variant ? variant.image : product.imageFront
    }
    return product?.imageFront
  }

  // Obtener la URL del modelo 3D según la variante seleccionada
  const getCurrentRender3DURL = () => {
    if (product?.variants && selectedVariant) {
      const variant = product.variants.find((v) => v.id === selectedVariant)
      return variant?.render3DURL || product.render3DURL
    }
    return product?.render3DURL
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        {config?.show_header_banner && config?.header_banner_text && (
          <SiteBanner
            text={config.header_banner_text}
            link={config.header_banner_link}
            color={config.header_banner_color}
            textColor={config.header_banner_text_color}
          />
        )}

        <Navbar user={user} />
        <main className="flex-1 container py-12">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Link href="/tienda" className="text-club-green hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver a la tienda
          </Link>
        </main>
        <Footer user={user} />
      </div>
    )
  }

  // Verificar si es el producto del vaso
  const isVaso = product.id === "vaso-ccc-plastico"

  return (
    <div className="flex min-h-screen flex-col">
      {config?.show_header_banner && config?.header_banner_text && (
        <SiteBanner
          text={config.header_banner_text}
          link={config.header_banner_link}
          color={config.header_banner_color}
          textColor={config.header_banner_text_color}
        />
      )}

      <Navbar user={user} />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container py-8">
          <Link
            href="/tienda"
            className="text-club-green dark:text-club-yellow hover:underline flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a la tienda
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-[500px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
              {!product.inStock && !product.is3D && (
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg text-center">
                    <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-red-500 mb-1">Sin Stock</h3>
                    <p className="text-gray-600 dark:text-gray-300">Este producto no está disponible actualmente</p>
                  </div>
                </div>
              )}

              {product.is3D ? (
                <div className="w-full h-full flex flex-col">
                  <div className="relative w-full h-1/3 flex items-center justify-center">
                    <Image
                      src={getCurrentImage() || "/placeholder.svg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain max-h-full"
                    />
                  </div>
                  <iframe
                    src={getCurrentRender3DURL()}
                    className="w-full h-2/3 border-0"
                    title={product.name}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={`relative w-[85%] h-[85%] ${imageScale}`}>
                  <Image
                    src={showBack ? product.imageBack || product.imageFront : product.imageFront}
                    alt={product.name}
                    fill
                    className="object-contain transition-opacity duration-300"
                  />
                </div>
              )}

              {product.badge && !product.is3D && (
                <Tooltip text={getBadgeTooltip(product.badge)} position="right">
                  <div
                    className={`absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm ${
                      product.badge === "Nueva"
                        ? "bg-club-green/90 text-white border border-white/30"
                        : product.badge === "Edición Especial"
                          ? "bg-club-yellow/90 text-black border border-black/30"
                          : "bg-gray-700/90 text-white border border-white/30"
                    }`}
                  >
                    {product.badge}
                  </div>
                </Tooltip>
              )}

              {product.imageBack && !product.is3D && (
                <button
                  onClick={toggleView}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 text-black dark:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
                >
                  {showBack ? <RotateCcw className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showBack ? "Ver frente" : "Ver dorso"}
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                {!product.inStock && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                    Sin Stock
                  </span>
                )}
              </div>

              {/* Selector de color para vasos */}
              {isVaso && product.variants && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                  <div className="flex gap-2">
                    {product.variants.map((variant) => (
                      <Tooltip key={variant.id} text={variant.name} position="top">
                        <button
                          onClick={() => setSelectedVariant(variant.id)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-all",
                            selectedVariant === variant.id
                              ? "ring-2 ring-offset-2 ring-club-green dark:ring-club-yellow"
                              : "hover:ring-1 hover:ring-gray-300",
                            variant.border && "border border-gray-300 dark:border-gray-600",
                          )}
                          style={{ backgroundColor: variant.color }}
                          aria-label={`Color ${variant.name}`}
                        >
                          {selectedVariant === variant.id && (
                            <Check
                              className={cn("h-4 w-4 mx-auto", variant.id === "negro" ? "text-white" : "text-gray-700")}
                            />
                          )}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-club-green dark:text-club-yellow text-2xl font-bold mb-4">
                ${product.price.toLocaleString()}
              </p>

              <div className="mb-6">{formatDescription(product.description)}</div>

              <div className="space-y-4">
                {/* Sección de talle - solo para camisetas */}
                {!isVaso && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">TALLE</h3>
                      <button
                        onClick={toggleSizeGuide}
                        className="text-club-green hover:text-club-green/80 dark:text-club-yellow dark:hover:text-club-yellow/80 text-xs flex items-center gap-1"
                      >
                        <Ruler className="h-3 w-3" />
                        Ver guía de talles
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          className={cn(
                            "py-1.5 rounded-md focus:outline-none transition-all text-sm",
                            selectedSize === size
                              ? "bg-club-green text-white dark:bg-club-yellow dark:text-black shadow-md"
                              : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-club-green dark:hover:border-club-yellow",
                            !product.inStock && "opacity-50 cursor-not-allowed",
                          )}
                          onClick={() => product.inStock && setSelectedSize(size)}
                          disabled={!product.inStock}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sección de cantidad y número en una fila */}
                <div className={`grid ${isVaso ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                  {/* Cantidad */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                    <h3 className="font-medium text-sm mb-2">CANTIDAD</h3>
                    <div className="flex items-center justify-center">
                      <button
                        className={cn(
                          "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-9 w-9 flex items-center justify-center rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-700",
                          !product.inStock && "opacity-50 cursor-not-allowed",
                        )}
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || !product.inStock}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-700 h-9 w-12 flex items-center justify-center text-base font-medium">
                        {quantity}
                      </div>
                      <button
                        className={cn(
                          "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-9 w-9 flex items-center justify-center rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700",
                          !product.inStock && "opacity-50 cursor-not-allowed",
                        )}
                        onClick={increaseQuantity}
                        disabled={quantity >= 10 || !product.inStock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Número - solo para camisetas */}
                  {!isVaso && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="with-number"
                          checked={withNumber}
                          onChange={() => product.inStock && setWithNumber(!withNumber)}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-club-green focus:ring-club-green dark:border-gray-600 dark:text-club-yellow dark:focus:ring-club-yellow disabled:opacity-50"
                          disabled={!product.inStock}
                        />
                        <label htmlFor="with-number" className="font-medium text-sm">
                          NÚMERO
                        </label>
                      </div>

                      <div className="flex items-center justify-center">
                        <input
                          type="text"
                          id="jersey-number"
                          value={jerseyNumber}
                          onChange={handleNumberChange}
                          placeholder="00"
                          disabled={!withNumber || !product.inStock}
                          className={`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 w-16 text-center text-lg font-medium focus:outline-none focus:ring-1 focus:ring-club-green dark:focus:ring-club-yellow ${
                            !withNumber || !product.inStock ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          maxLength={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className={cn(
                  "w-full mt-6 py-6 text-lg font-medium flex items-center justify-center gap-2 transition-all",
                  product.inStock && (selectedSize || isVaso)
                    ? "bg-club-green hover:bg-club-green/90 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed",
                )}
                onClick={addToCart}
                disabled={(!selectedSize && !isVaso) || !product.inStock}
              >
                <ShoppingBag className="h-6 w-6" />
                {!product.inStock
                  ? "Sin Stock"
                  : isVaso
                    ? "Agregar al carrito"
                    : selectedSize
                      ? "Agregar al carrito"
                      : "Selecciona un talle"}
              </Button>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer user={user} />

      {/* Modal de guía de talles */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={toggleSizeGuide}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Guía de Talles</h3>
              <button onClick={toggleSizeGuide} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative w-full h-[400px]">
                <Image src="/images/tabla-talles.png" alt="Tabla de talles" fill className="object-contain" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">A: Largo | B: Ancho | C: Largo total</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Todas las medidas están expresadas en centímetros.
              </p>
            </div>
            <Button className="w-full" onClick={toggleSizeGuide}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
