import { Topbar } from "@/components/Topbar"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-medium mb-6">Welcome to SuitSupply</h1>
        <Link href="/orders" className="px-4 py-2 bg-gray-900 text-white rounded">
          View Your Orders
        </Link>
      </div>
    </div>
  )
}
