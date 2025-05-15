import type React from "react"
interface SummaryItemProps {
  label: string | React.ReactNode
  value: string | React.ReactNode
  isTotal?: boolean
}

export function SummaryItem({ label, value, isTotal = false }: SummaryItemProps) {
  return (
    <div className={`flex justify-between items-center py-2 ${isTotal ? "font-medium" : ""}`}>
      <div className={isTotal ? "text-base" : "text-sm text-gray-600"}>{label}</div>
      <div className={isTotal ? "text-base" : "text-sm"}>{value}</div>
    </div>
  )
}
