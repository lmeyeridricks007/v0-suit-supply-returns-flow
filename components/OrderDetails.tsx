"use client"

import { useState, useEffect } from "react"
import { fetchOrderDetails, type OrderDetailsResponse } from "@/app/actions/fetchOrderDetails"
import { Loader2 } from "lucide-react"

interface OrderDetailsProps {
  initialOrderId?: string
  initialAccountNumber?: string
}

export function OrderDetails({ initialOrderId = "KLNL_8", initialAccountNumber = "SF007353795" }: OrderDetailsProps) {
  const [orderId, setOrderId] = useState(initialOrderId)
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber)
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawResponse, setRawResponse] = useState<string>("")

  useEffect(() => {
    async function getOrderDetails() {
      setLoading(true)
      const { data, error, rawResponse } = await fetchOrderDetails(orderId, accountNumber)
      setOrderDetails(data)
      setError(error)
      setRawResponse(rawResponse)
      setLoading(false)
    }

    getOrderDetails()
  }, [orderId, accountNumber])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <h3 className="font-medium text-red-700 mb-2">Error loading order details</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="border border-gray-200 rounded-md p-4">
        <p className="text-gray-500">No order details available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Order #{orderDetails.orderId}</h3>
              <p className="text-sm text-gray-600">{formatDate(orderDetails.orderDate)}</p>
              <p className="text-sm text-gray-600 mt-1">Status: {orderDetails.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Total</p>
              <p className="font-medium">
                {orderDetails.currencySign || "€"}
                {orderDetails.totalAmount}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {orderDetails.orderItems &&
            orderDetails.orderItems.map((item, index) => (
              <div key={index} className="p-4 flex items-center">
                <div className="w-[60px] h-[60px] bg-gray-100 flex-shrink-0 mr-4">
                  {item.productDetails?.imageUrl ? (
                    <img
                      src={item.productDetails.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="flex text-sm text-gray-600 mt-1">
                    <p className="mr-4">Qty. {item.quantity}</p>
                    <p>Size {item.productDetails?.sizeEUR || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {orderDetails.currencySign || "€"}
                    {item.total}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">API Request & Response</h3>

        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Request:</h4>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs">
            {`curl -X GET "https://orderhistory-tst-af.azurewebsites.net/api/internal/webstore/orders/${orderId}?accountNumber=${accountNumber}&code=TZfbwt8pmhjKXc9Oh94u1IHP5qCgOQPl7CZ0Xr7xSFzGq%2F%2FVLhG9KS%3D%3D" -H "accept: json/application"`}
          </pre>
        </div>

        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Response:</h4>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs max-h-96 overflow-y-auto">
            {JSON.stringify(JSON.parse(rawResponse), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
