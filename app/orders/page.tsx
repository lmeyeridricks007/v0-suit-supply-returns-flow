import { Topbar } from "@/components/Topbar"
import Link from "next/link"

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <div className="px-4 py-6">
        <h1 className="text-2xl font-medium mb-4">Your Orders</h1>

        <div className="border border-gray-200 rounded-md p-4 mb-4">
          <h2 className="font-medium mb-2">Order #12345</h2>
          <p className="text-sm text-gray-600 mb-2">May 15, 2023</p>
          <p className="text-sm mb-4">2 items - €417</p>
          <Link href="/returns" className="text-sm font-medium underline">
            Return or exchange items
          </Link>
        </div>
      </div>
    </div>
  )
}
