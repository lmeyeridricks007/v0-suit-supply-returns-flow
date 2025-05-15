import type React from "react"
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  fullWidth?: boolean
  children: React.ReactNode
}

export function Button({ variant = "primary", fullWidth = false, children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`
        px-4 py-3 rounded
        ${
          variant === "primary"
            ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
