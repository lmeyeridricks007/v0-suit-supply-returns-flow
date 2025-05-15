"use client"

import { Topbar } from "@/components/Topbar"
import { BackButton } from "@/components/BackButton"
import Link from "next/link"

// Sample data for returned products with direct image URLs
const returnedProducts = [
  {
    id: 1,
    name: "Purple Crewneck",
    image:
      "https://cdn.suitsupply.com/image/upload/w_210,h_257,c_lfill,g_center,b_rgb:efefef,f_auto//suitsupply/campaigns/ss25/quicklinks/knitwear/crewnecks_v-necks.jpg",
    quantity: 1,
    size: "L",
    price: 99,
  },
  {
    id: 2,
    name: "Black Wide Leg Straight Trousers",
    image:
      "https://cdn.suitsupply.com/image/upload/w_120,h_144,c_lfill,g_center,b_rgb:efefef,f_auto//suitsupply/campaigns/ss25/quicklinks/trousers/trousers_4ply-traveller-trousers.jpg",
    quantity: 2,
    size: "52",
    price: 159, // Price per item
  },
  {
    id: 3,
    name: "Sand Havana Custom Made Jacket",
    image:
      "https://cdn.suitsupply.com/image/upload/w_120,h_144,c_lfill,g_center,b_rgb:efefef,f_auto//suitsupply/campaigns/ss25/quicklinks/jackets/blazers_patterned-blazers.jpg",
    quantity: 1,
    size: "52",
    price: 673,
  },
]

export default function ReturnConfirmationPage() {
  const handleDownloadLabel = () => {
    // In a real app, this would trigger a download of the return label
    alert("Downloading return label...")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Topbar />
      <BackButton href="/orders" label="Orders" />

      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-medium mb-4">Return registered</h1>
        <p className="text-gray-600 mb-8">
          Attach the return label to the original
          <br />
          box and send it to Suitsupply.
        </p>

        <button
          onClick={handleDownloadLabel}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-md mb-12"
        >
          Download label
        </button>
      </div>

      <div className="px-4 pb-12">
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {returnedProducts.map((product, index) => (
            <div key={product.id} className={index !== 0 ? "border-t border-gray-200" : ""}>
              <div className="flex">
                <div className="w-[246px] h-[246px] bg-gray-50 flex-shrink-0">
                  <img
                    src={product.image || "/placeholder.svg"}
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

                  <div className="mt-8">
                    <p>Qty. {product.quantity}</p>
                    <p>Size {product.size}</p>
                  </div>
                </div>
                <div className="p-4 text-right">
                  <p className="font-medium">
                    €{product.quantity > 1 ? product.price * product.quantity : product.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-auto mb-8">
        <Link href="/orders" className="block w-full py-3 bg-gray-900 text-white text-center rounded-md">
          Back to orders
        </Link>
      </div>
    </div>
  )
}
