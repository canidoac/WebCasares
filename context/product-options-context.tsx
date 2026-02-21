"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface ProductOptionsContextType {
  openProductId: string | null
  setOpenProductId: (id: string | null) => void
}

const ProductOptionsContext = createContext<ProductOptionsContextType | undefined>(undefined)

export function ProductOptionsProvider({ children }: { children: React.ReactNode }) {
  const [openProductId, setOpenProductId] = useState<string | null>(null)

  return (
    <ProductOptionsContext.Provider value={{ openProductId, setOpenProductId }}>
      {children}
    </ProductOptionsContext.Provider>
  )
}

export function useProductOptions() {
  const context = useContext(ProductOptionsContext)
  if (context === undefined) {
    throw new Error("useProductOptions must be used within a ProductOptionsProvider")
  }
  return context
}
