"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  maxQuantity: number
  initialQuantity: number
  onChange: (quantity: number) => void
}

export function QuantitySelector({ maxQuantity, initialQuantity, onChange }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity)

  const increment = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1
      setQuantity(newQuantity)
      onChange(newQuantity)
    }
  }

  const decrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      onChange(newQuantity)
    }
  }

  return (
    <div className="flex items-center justify-between border border-gray-200 rounded p-3 mt-4">
      <span className="text-sm">Quantity</span>
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrement}
          disabled={quantity <= 1}
          className={`p-1 ${quantity <= 1 ? "text-gray-300" : "text-gray-700"}`}
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="mx-3 min-w-[20px] text-center">{quantity}</span>
        <button
          type="button"
          onClick={increment}
          disabled={quantity >= maxQuantity}
          className={`p-1 ${quantity >= maxQuantity ? "text-gray-300" : "text-gray-700"}`}
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
