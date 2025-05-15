"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ReturnReasonDropdownProps {
  selectedReason: string
  onSelect: (reason: string) => void
  reasons: string[]
}

export function ReturnReasonDropdown({ selectedReason, onSelect, reasons }: ReturnReasonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleSelect = (reason: string) => {
    onSelect(reason)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        className="w-full flex items-center justify-between border border-gray-200 rounded p-3 text-left"
        onClick={toggleDropdown}
        type="button"
      >
        <span className="text-gray-700">{selectedReason || "Reason for return"}</span>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {reasons.map((reason) => (
            <button
              key={reason}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleSelect(reason)}
              type="button"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
