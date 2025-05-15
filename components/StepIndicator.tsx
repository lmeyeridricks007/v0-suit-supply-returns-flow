import type React from "react"
interface StepIndicatorProps {
  number: number
  isActive: boolean
  children: React.ReactNode
}

export function StepIndicator({ number, isActive, children }: StepIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-4 py-4 px-5 ${isActive ? "bg-white" : "bg-gray-50"} border-t border-gray-200`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-medium">
        {number}
      </div>
      <div className="text-base font-medium">{children}</div>
    </div>
  )
}
