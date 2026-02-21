"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, RotateCcw, X, Plus, Minus, ShoppingBag, Ruler, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Tooltip } from "@/components/tooltip"
import { useCart } from "@/context/cart-context"
import { useProductOptions } from "@/context/product-options-context"

interface ProductVariant {
  id: string
  name: string
  image: string
  color?: string
  border?: boolean
  render3DURL?: string
}

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageFront: string
  imageBack?: string
  badge?: string
  is3D?: boolean
  render3DURL?: string
  inStock?: boolean
  description?: string
  variants?: ProductVariant[]
}

export function ProductCard({
  id,
  name,
  price,
  imageFront,
  imageBack,
  badge,
  is3D,
  render3DURL,
  inStock = true,
  description,
  variants,
}: ProductCardProps) {
  const [showBack, setShowBack] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [withNumber, setWithNumber] = useState(false)
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variants && variants.length > 0 ? variants[0].id : null,
  )

  // Usar el contexto del carrito
  const { addItem } = useCart()

  // Usar el contexto de opciones de producto
  const { openProductId, setOpenProductId } = useProductOptions()

  // Determinar si este producto tiene sus opciones abiertas
  const isOpen = openProductId === id

  // Efecto para resetear los valores cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setSelectedSize(null)
      setQuantity(1)
      setWithNumber(false)
      setJerseyNumber("")
    }
  }, [isOpen])

  const toggleView = () => {
    setShowBack(!showBack)
  }

  const toggleOptions = () => {
    if (isOpen) {
      setOpenProductId(null)
    } else {
      setOpenProductId(id)
    }
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Solo permitir números y limitar a 2 dígitos
    if (/^\d{0,2}$/.test(value)) {
      setJerseyNumber(value)
    }
  }

  const addToCart = () => {
    if ((!selectedSize && id !== "vaso-ccc-plastico") || !inStock) return

    // Obtener la variante seleccionada si existe
    const currentVariant = variants?.find((v) => v.id === selectedVariant)

    // Crear el objeto del item para el carrito
    const cartItem = {
      id,
      name,
      price,
      image: currentVariant?.image || imageFront,
      quantity,
      size: id === "vaso-ccc-plastico" ? undefined : selectedSize || undefined,
      color: currentVariant?.name,
      number: withNumber ? jerseyNumber : undefined,
    }

    // Añadir al carrito
    addItem(cartItem)

    // Cerrar opciones después de añadir al carrito
    setOpenProductId(null)
  }

  const sizes = ["16", "S", "M", "L", "XL", "XXL"]

  // Ajuste especial para la camiseta de Malatini
  const isSpecialProduct = id === "camiseta-roja-aviador"

  // Verificar si es el vaso
  const isVaso = id === "vaso-ccc-plastico"

  // Obtener la imagen actual según la variante seleccionada
  const getCurrentImage = () => {
    if (variants && selectedVariant) {
      const variant = variants.find((v) => v.id === selectedVariant)
      return variant ? variant.image : imageFront
    }
    return showBack && imageBack ? imageBack : imageFront
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg relative">
      <div className="relative">
        <div className="relative h-80 w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          {is3D ? (
            <Link href={`/tienda/${id}`} className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4">
                <Image
                  src={getCurrentImage() || "/placeholder.svg"}
                  alt={name}
                  width={200}
                  height={250}
                  className="object-contain mx-auto mb-4"
                />
                <div className="bg-club-green text-white dark:bg-club-yellow dark:text-black rounded-full px-4 py-2 mb-2 inline-block">
                  Ver en 3D
                </div>
              </div>
            </Link>
          ) : (
            <div className={`relative ${isSpecialProduct ? "w-[85%] h-[85%]" : "w-[90%] h-[90%]"}`}>
              <Image
                src={showBack && imageBack ? imageBack : imageFront}
                alt={name}
                fill
                className="object-contain transition-opacity duration-300"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        {imageBack && !is3D && (
          <div className="flex justify-center mt-2 mb-1">
            <button
              onClick={toggleView}
              className="bg-white dark:bg-gray-800 text-black dark:text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
              aria-label={showBack ? "Ver frente" : "Ver dorso"}
            >
              {showBack ? <RotateCcw className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showBack ? "Ver frente" : "Ver dorso"}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 h-12 line-clamp-2">{name}</h3>

        {/* Selector de color para vasos */}
        {isVaso && variants && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Color:</span>
            <div className="flex gap-1.5">
              {variants.map((variant) => (
                <Tooltip key={variant.id} text={variant.name} position="top">
                  <button
                    onClick={() => setSelectedVariant(variant.id)}
                    className={cn(
                      "w-5 h-5 rounded-full transition-all",
                      selectedVariant === variant.id
                        ? "ring-2 ring-club-green dark:ring-club-yellow"
                        : "hover:ring-1 hover:ring-gray-300",
                      variant.border && "border border-gray-300 dark:border-gray-600",
                    )}
                    style={{ backgroundColor: variant.color }}
                    aria-label={`Color ${variant.name}`}
                  >
                    {selectedVariant === variant.id && (
                      <Check
                        className={cn("h-3 w-3 mx-auto", variant.id === "negro" ? "text-white" : "text-gray-700")}
                      />
                    )}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        <p className="text-club-green dark:text-club-yellow font-bold mb-3 h-6">${price.toLocaleString()}</p>
        <div className="mt-auto">
          <Button
            className={cn(
              "w-full",
              inStock
                ? "bg-club-green hover:bg-club-green/90 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed",
            )}
            onClick={inStock ? toggleOptions : undefined}
            disabled={!inStock}
          >
            {inStock ? "Seleccionar opciones" : "Sin Stock"}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 flex flex-col p-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-base">{name}</h3>
            <button
              onClick={toggleOptions}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nueva sección: Imagen pequeña del producto */}
          <div className="flex items-start gap-3 mb-3">
            <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
              <Image src={getCurrentImage() || "/placeholder.svg"} alt={name} fill className="object-contain p-1" />
            </div>
            <div className="flex-1">
              {description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg">
                  {formatDescription(description)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {/* Sección de variantes de color - solo para vasos */}
            {isVaso && variants && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5">
                <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1.5">COLOR</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={cn(
                        "py-1.5 px-2 rounded-md focus:outline-none transition-all text-sm relative",
                        selectedVariant === variant.id
                          ? "bg-club-green/10 border-2 border-club-green dark:bg-club-yellow/10 dark:border-club-yellow"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-club-green dark:hover:border-club-yellow",
                      )}
                      onClick={() => setSelectedVariant(variant.id)}
                    >
                      {variant.name}
                      {selectedVariant === variant.id && (
                        <Check className="h-3 w-3 absolute top-1 right-1 text-club-green dark:text-club-yellow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de talle - solo para camisetas */}
            {!isVaso && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300">TALLE</h4>
                  <button
                    onClick={toggleSizeGuide}
                    className="text-club-green hover:text-club-green/80 dark:text-club-yellow dark:hover:text-club-yellow/80 text-xs flex items-center gap-1"
                  >
                    <Ruler className="h-3 w-3" />
                    Ver guía
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={cn(
                        "py-1.5 rounded-md focus:outline-none transition-all text-sm font-medium",
                        selectedSize === size
                          ? "bg-club-green text-white dark:bg-club-yellow dark:text-black shadow-md"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-club-green dark:hover:border-club-yellow",
                      )}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de cantidad y número en una fila */}
            <div className={`grid ${isVaso ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
              {/* Cantidad */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5">
                <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1.5">CANTIDAD</h4>
                <div className="flex items-center justify-center">
                  <button
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-8 w-8 flex items-center justify-center rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <div className="bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 h-8 w-10 flex items-center justify-center text-base font-medium">
                    {quantity}
                  </div>
                  <button
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-8 w-8 flex items-center justify-center rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={increaseQuantity}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Número - solo para camisetas */}
              {!isVaso && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5">
                  <div className="flex items-center mb-1.5">
                    <input
                      type="checkbox"
                      id={`with-number-${id}`}
                      checked={withNumber}
                      onChange={() => setWithNumber(!withNumber)}
                      className="mr-1.5 h-3.5 w-3.5 rounded border-gray-300 text-club-green focus:ring-club-green dark:border-gray-600 dark:text-club-yellow dark:focus:ring-club-yellow"
                    />
                    <label
                      htmlFor={`with-number-${id}`}
                      className="text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      NÚMERO
                    </label>
                  </div>

                  <div className="flex items-center justify-center">
                    <input
                      type="text"
                      id={`jersey-number-${id}`}
                      value={jerseyNumber}
                      onChange={handleNumberChange}
                      placeholder="00"
                      disabled={!withNumber}
                      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 w-12 text-center text-base font-medium focus:outline-none focus:ring-1 focus:ring-club-green dark:focus:ring-club-yellow ${
                        !withNumber ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      maxLength={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full bg-club-green hover:bg-club-green/90 text-white mt-3 flex items-center justify-center gap-2 py-2 text-sm font-medium"
            onClick={addToCart}
            disabled={!selectedSize && !isVaso}
          >
            <ShoppingBag className="h-4 w-4" />
            {isVaso ? "Agregar al carrito" : selectedSize ? "Agregar al carrito" : "Selecciona un talle"}
          </Button>
        </div>
      )}

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
