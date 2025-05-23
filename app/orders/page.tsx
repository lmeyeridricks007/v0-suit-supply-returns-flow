"use client"

import { Topbar } from "@/components/Topbar"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Container } from "@/components/Container"

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const countryCode = searchParams.get("countryCode") || "ES"
  const accountNumber = searchParams.get("accountNumber") || "SF007353795"

  // Use KLNL_8 as the OrderID
  const orderId = "KLNL_8"

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <Container>
        <div className="py-6">
          <h1 className="text-2xl font-medium mb-4">Your Orders</h1>

          <div className="border border-gray-200 rounded-md p-4 mb-4">
            <h2 className="font-medium mb-2">Order #{orderId}</h2>
            <p className="text-sm text-gray-600 mb-2">May 15, 2023</p>
            <p className="text-sm mb-4">2 items - €417</p>
            <Link
              href={`/returns?OrderID=${orderId}&countryCode=${countryCode}&accountNumber=${accountNumber}`}
              className="text-sm font-medium underline"
            >
              Return or exchange items
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
