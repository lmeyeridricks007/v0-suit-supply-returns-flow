"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { BackButton } from "@/components/BackButton"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import type { CreateReturnResponse } from "@/app/actions/createReturn"
import { Container } from "@/components/Container"

interface ReturnedItem {
  id?: number
  name: string
  image?: string
  productDetails?: {
    imageUrl?: string
    sizeEUR?: string
    sizeUK?: string
    sizeUS?: string
    sizeCN?: string
    displaySize?: string
  }
  quantity: number
  returnQuantity: number
  size?: string
  price?: number
  total: number
  returnReason: string
}

export default function ReturnConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("OrderID") || "KLNL_8"
  const countryCode = searchParams.get("countryCode") || "ES"
  const accountNumber = searchParams.get("accountNumber") || "SF007353795"

  const [showLabel, setShowLabel] = useState(false)
  const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>([])
  const [returnResponse, setReturnResponse] = useState<CreateReturnResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const labelUrl =
    "https://pre.cycleon.net/labels/printables/Parcel/2025/5/20/%2800%29087000000012012689_L326SP0720625200108070Y_1747731641117.PNG"

  useEffect(() => {
    // Get returned items from localStorage
    const storedItems = localStorage.getItem("returnedItems")
    const storedResponse = localStorage.getItem("returnResponse")

    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems)
        setReturnedItems(parsedItems)
      } catch (error) {
        console.error("Failed to parse returned items:", error)
      }
    }

    if (storedResponse) {
      try {
        const parsedResponse = JSON.parse(storedResponse)
        setReturnResponse(parsedResponse)
      } catch (error) {
        console.error("Failed to parse return response:", error)
      }
    }

    setLoading(false)
  }, [])

  const handleDownloadLabel = () => {
    // Show the label image
    setShowLabel(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Topbar />

      <Container>
        <BackButton href={`/orders?countryCode=${countryCode}&accountNumber=${accountNumber}`} label="Orders" />

        <div className="py-8 text-center">
          <h1 className="text-2xl font-medium mb-4">Return registered</h1>
          <p className="text-gray-600 mb-8">
            Attach the return label to the original
            <br />
            box and send it to Suitsupply.
          </p>

          <button
            onClick={handleDownloadLabel}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-md mb-6"
          >
            Download label
          </button>
        </div>

        <div className="pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Items to Return</h2>
            {returnResponse && <div className="text-sm text-gray-600">Return #{returnResponse.data.OrderId}</div>}
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : returnedItems.length > 0 ? (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {returnedItems.map((product, index) => (
                <div key={index} className={index !== 0 ? "border-t border-gray-200" : ""}>
                  <div className="flex">
                    <div className="w-[246px] h-[246px] bg-gray-50 flex-shrink-0">
                      <img
                        src={product.productDetails?.imageUrl || product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow p-4">
                      <h3 className="text-lg font-medium">{product.name}</h3>

                      <div className="flex items-center text-gray-500 mt-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                        </svg>
                        <span>Return</span>
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        <p>Reason: {product.returnReason}</p>
                      </div>

                      <div className="mt-4">
                        <p>
                          Qty. {product.returnQuantity} of {product.quantity}
                        </p>
                        <p>
                          Size{" "}
                          {product.productDetails?.displaySize ||
                            product.productDetails?.sizeEUR ||
                            product.size ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 text-right">
                      <p className="font-medium">
                        €{((product.total * product.returnQuantity) / product.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md p-8 text-center text-gray-500">
              No items selected for return
            </div>
          )}
        </div>

        <div className="mt-auto mb-8">
          <Link
            href={`/orders?countryCode=${countryCode}&accountNumber=${accountNumber}`}
            className="block w-full py-3 bg-gray-900 text-white text-center rounded-md"
          >
            Back to orders
          </Link>
        </div>
      </Container>

      {showLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Return Label</h2>
              <button onClick={() => setShowLabel(false)} className="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <img src={labelUrl || "/placeholder.svg"} alt="Return Label" className="w-full h-auto" />
            </div>
            <div className="mt-4 flex justify-between">
              <button onClick={() => setShowLabel(false)} className="px-4 py-2 border border-gray-300 rounded">
                Close
              </button>
              <a
                href={labelUrl}
                download="return-label.png"
                className="px-4 py-2 bg-gray-900 text-white rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Save Label
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
