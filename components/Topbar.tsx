import Link from "next/link"
import { Menu, User, Bookmark, ShoppingBag } from "lucide-react"

export function Topbar() {
  return (
    <header className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
      <button aria-label="Menu" className="p-1">
        <Menu size={20} strokeWidth={1.5} />
      </button>

      <Link href="/" className="text-center">
        <h1 className="text-lg font-medium tracking-widest">SUITSUPPLY</h1>
      </Link>

      <div className="flex items-center gap-5">
        <button aria-label="Account" className="p-1">
          <User size={20} strokeWidth={1.5} />
        </button>
        <button aria-label="Saved Items" className="p-1">
          <Bookmark size={20} strokeWidth={1.5} />
        </button>
        <button aria-label="Shopping Bag" className="p-1">
          <ShoppingBag size={20} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
