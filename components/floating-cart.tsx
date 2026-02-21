"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, X, Plus, Minus, Trash2, AlertCircle, CreditCard, MessageCircle } from "lucide-react"
import { useCart, type CartItem } from "@/context/cart-context"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [payInInstallments, setPayInInstallments] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const { theme } = useTheme()

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cerrar el carrito al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('[data-cart="true"]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Animar el botón del carrito cuando se agrega un producto
  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [totalItems])

  const toggleCart = () => {
    setIsOpen(!isOpen)
  }

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(item.id, newQuantity, item.size, item.color)
  }

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id, item.size, item.color)
  }

  const handleCheckout = () => {
    // Preparar el mensaje para WhatsApp
    let message = "Hola! Quiero realizar el siguiente pedido:\n\n"

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}`
      if (item.size) message += ` - Talle: ${item.size}`
      if (item.color) message += ` - Color: ${item.color}`
      if (item.number) message += ` - Número: ${item.number}`
      message += ` - Cantidad: ${item.quantity} - $${item.price.toLocaleString()}\n`
    })

    message += `\nTotal: $${totalPrice.toLocaleString()}`

    if (payInInstallments) {
      message += `\nQuiero pagar en 2 cuotas de $${Math.ceil(totalPrice / 2).toLocaleString()} cada una.`
    }

    // Número de WhatsApp actualizado
    const phoneNumber = "5492396437621"

    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  // Calcular el monto de cada cuota
  const installmentAmount = Math.ceil(totalPrice / 2)

  // Si no hay productos en el carrito y no está abierto, no mostrar nada
  if (totalItems === 0 && !isOpen) {
    return null
  }

  // Si no está montado aún, no mostrar nada para evitar problemas de hidratación
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Overlay para cuando el carrito está abierto en móvil */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Botón flotante del carrito - Cambia según el tema */}
      <button
        onClick={toggleCart}
        className={cn(
          "fixed bottom-16 right-6 z-50 rounded-full p-4 shadow-lg flex items-center justify-center transition-all",
          theme === "dark" ? "bg-club-yellow text-black" : "bg-club-green text-white",
          isAnimating && "animate-bounce",
          isOpen && "opacity-0 md:opacity-100",
        )}
        aria-label="Carrito de compras"
        data-cart="true"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span
            className={cn(
              "absolute -top-2 -right-2 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center",
              theme === "dark" ? "bg-club-green text-white" : "bg-club-yellow text-black",
            )}
          >
            {totalItems}
          </span>
        )}
      </button>

      {/* Panel desplegable del carrito */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-xl z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        data-cart="true"
      >
        <div className="flex flex-col h-full">
          {/* Encabezado del carrito - Alineado con el header principal */}
          <div className="sticky top-0 z-10 h-20 border-b dark:border-gray-700 flex justify-between items-center px-4 md:px-8 bg-club-green dark:bg-club-yellow text-white dark:text-black">
            <h2 className="text-xl font-bold flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Carrito ({totalItems})
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "p-1 rounded-full transition-colors",
                theme === "dark" ? "hover:bg-black/10" : "hover:bg-white/20",
              )}
              aria-label="Cerrar carrito"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Tu carrito está vacío</p>
                <p className="text-sm mt-2 text-center">Agrega productos desde la tienda para verlos aquí</p>
                <Button className="mt-6" onClick={() => setIsOpen(false)}>
                  Seguir comprando
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}-${index}`}
                    className="flex border-b dark:border-gray-700 pb-4"
                  >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h3>
                        <p className="font-bold text-club-green dark:text-club-yellow">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Detalles del producto */}
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.size && <span className="mr-2">Talle: {item.size}</span>}
                        {item.color && <span className="mr-2">Color: {item.color}</span>}
                        {item.number && <span>Número: {item.number}</span>}
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie del carrito con resumen y botón de checkout */}
          {items.length > 0 && (
            <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold">${totalPrice.toLocaleString()}</span>
              </div>

              {/* Opción de pago en cuotas */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payInInstallments}
                    onChange={() => setPayInInstallments(!payInInstallments)}
                    className={cn(
                      "h-4 w-4 rounded border-gray-300 focus:ring-2",
                      theme === "dark"
                        ? "text-club-yellow focus:ring-club-yellow/20"
                        : "text-club-green focus:ring-club-green/20",
                    )}
                  />
                  <span className="text-sm flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Pagar en 2 cuotas
                  </span>
                </label>

                {payInInstallments && (
                  <div
                    className={cn(
                      "mt-2 border rounded-md p-2 text-sm",
                      theme === "dark"
                        ? "bg-club-yellow/10 border-club-yellow/30"
                        : "bg-club-green/10 border-club-green/30",
                    )}
                  >
                    <p className="font-medium">2 cuotas de ${installmentAmount.toLocaleString()} cada una</p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Recuerda que los pedidos tienen un tiempo de producción de aproximadamente entre 25 y 35 días.
                </p>
              </div>

              <Button
                className={cn(
                  "w-full py-6 flex items-center justify-center gap-2",
                  theme === "dark"
                    ? "bg-club-yellow hover:bg-club-yellow/90 text-black"
                    : "bg-club-green hover:bg-club-green/90 text-white",
                )}
                onClick={handleCheckout}
              >
                <MessageCircle className="h-5 w-5" />
                Realizar Pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
