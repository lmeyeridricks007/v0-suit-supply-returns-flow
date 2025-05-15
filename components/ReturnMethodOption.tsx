"use client"

import type React from "react"

interface ReturnMethodOptionProps {
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

export function ReturnMethodOption({ icon, title, description, selected, onClick }: ReturnMethodOptionProps) {
  return (
    <button
      className={`w-full flex items-start gap-4 p-4 border rounded-md mb-4 text-left ${
        selected ? "border-gray-400" : "border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="text-gray-700 mt-1">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  )
}
