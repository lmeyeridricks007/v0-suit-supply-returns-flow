import { Topbar } from "@/components/Topbar"
import Link from "next/link"
import { ReboundTokenDisplay } from "@/components/ReboundTokenDisplay"
import { Container } from "@/components/Container"

export default function HomePage() {
  // Default parameters
  const countryCode = "ES"
  const accountNumber = "SF007353795"

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <Container>
        <div className="flex-grow flex flex-col py-4">
          <h1 className="text-2xl font-medium mb-6 text-center">Welcome to SuitSupply Returns Flow</h1>

          <div className="w-full mb-8">
            <ReboundTokenDisplay />
          </div>

          <div className="flex flex-col items-center">
            <Link
              href={`/orders?countryCode=${countryCode}&accountNumber=${accountNumber}`}
              className="px-4 py-2 bg-gray-900 text-white rounded mb-4"
            >
              View Your Orders
            </Link>
            <p className="text-sm text-gray-600 text-center">
              Start the returns process by viewing your orders and selecting items to return.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
