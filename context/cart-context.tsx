"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  number?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Validar que cada item tenga las propiedades necesarias
          const validItems = parsedCart.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.id &&
              item.name &&
              typeof item.price === "number" &&
              typeof item.quantity === "number" &&
              item.quantity > 0,
          )
          if (validItems.length > 0) {
            setItems(validItems)
          } else {
            // Si no hay items válidos, limpiar localStorage
            localStorage.removeItem("cart")
          }
        }
      } catch (error) {
        console.error("[v0] Error parsing cart from localStorage:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
    } else {
      // Si el carrito está vacío, remover de localStorage
      localStorage.removeItem("cart")
    }

    // Calcular totales
    const itemCount = items.reduce((total, item) => total + item.quantity, 0)
    const priceSum = items.reduce((total, item) => total + item.price * item.quantity, 0)

    setTotalItems(itemCount)
    setTotalPrice(priceSum)
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Verificar si el producto ya existe en el carrito con las mismas opciones
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color &&
          item.number === newItem.number,
      )

      if (existingItemIndex >= 0) {
        // Si existe, actualizar la cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Si no existe, agregar nuevo item
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (id: string, size?: string, color?: string) => {
    setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.size === size && item.color === color)))
  }

  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.size === size && item.color === color) {
          return { ...item, quantity }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
