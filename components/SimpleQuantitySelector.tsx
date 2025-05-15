"use client"

import { Minus, Plus } from "lucide-react"

interface SimpleQuantitySelectorProps {
  quantity: number
  onDecrement: () => void
  onIncrement: () => void
  maxQuantity: number
}

export function SimpleQuantitySelector({
  quantity,
  onDecrement,
  onIncrement,
  maxQuantity,
}: SimpleQuantitySelectorProps) {
  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 1}
        className={`p-2 ${quantity <= 1 ? "text-gray-300" : "text-gray-700"}`}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="mx-4 min-w-[20px] text-center">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={quantity >= maxQuantity}
        className={`p-2 ${quantity >= maxQuantity ? "text-gray-300" : "text-gray-700"}`}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
