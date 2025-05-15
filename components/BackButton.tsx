import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface BackButtonProps {
  href: string
  label: string
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Link href={href} className="flex items-center gap-1 text-gray-500 py-5 px-5">
      <ChevronLeft size={20} strokeWidth={1.5} />
      <span className="text-sm">{label}</span>
    </Link>
  )
}
