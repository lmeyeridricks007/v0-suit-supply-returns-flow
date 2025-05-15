import Image from "next/image"
import { ChevronDown } from "lucide-react"

interface ReturnProductCardProps {
  name: string
  image: string
  quantity: number
  size: string
  price: number
}

export function ReturnProductCard({ name, image, quantity, size, price }: ReturnProductCardProps) {
  return (
    <div className="mb-4 mx-auto w-full max-w-[600px] border border-gray-200 rounded-md overflow-hidden">
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-[132px] h-[132px] bg-gray-100 flex-shrink-0">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={132}
              height={132}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-base font-medium">{name}</h3>
              <div className="text-sm text-gray-600 mt-4">
                <p>Qty. {quantity}</p>
                <p>Size {size}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">€{price}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button className="w-full flex items-center justify-between border border-gray-200 rounded p-3 text-left">
          <span className="text-gray-700">Reason for return</span>
          <ChevronDown size={20} className="text-gray-500" />
        </button>
      </div>
    </div>
  )
}
