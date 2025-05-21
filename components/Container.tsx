import type { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className = "" }: ContainerProps) {
  return <div className={`mx-auto max-w-[800px] w-full px-4 md:px-6 ${className}`}>{children}</div>
}
