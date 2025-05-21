"use server"

import { getSizeByCountry } from "@/lib/sizeUtils"

export interface OrderDetailsResponse {
  orderId: string
  status: string
  orderDate: string
  currencyCode: string
  currencySign: string
  totalAmount: number
  orderItems: {
    name: string
    productDetails: {
      sizeEUR: string
      sizeUK: string
      sizeUS: string
      sizeCN: string
      imageUrl: string
      displaySize: string // New field for the formatted size display
    }
    quantity: number
    total: number
    canReturn: boolean
  }[]
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  shippingAddress: {
    firstName: string
    lastName: string
    addressLine1: string
    addressLine2: string
    city: string
    country: string
    postalCode: string
  }
}

// Update the WebstoreOrderResponse interface to include all size types
export interface WebstoreOrderResponse {
  orderId: string
  status: string
  orderDate: string
  currencyCode: string
  currencySign: string
  totalAmount: number
  items: {
    name: string
    quantity: number
    total: number
    productCode: string
    canReturn: boolean
    productDetails: {
      sizeEUR: string
      sizeUK: string
      sizeUS: string
      sizeCN: string
      images: {
        secureUrl: string
      }[]
    }
  }[]
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  shippingAddress: {
    firstName: string
    lastName: string
    addressLine1: string
    addressLine2: string
    city: string
    country: string
    postalCode: string
  }
}

export async function fetchOrderDetails(
  orderId: string,
  accountNumber = "SF007353795",
  countryCode = "ES",
): Promise<{
  data: OrderDetailsResponse | null
  error: string | null
  rawResponse: string
}> {
  try {
    const apiKey = "TZfbwt8pmhjKXc9Oh94u1IHP5qCgOQPl7CZ0Xr7xSFzGq//VLhG9KS=="
    // Updated URL to use the webstore endpoint and include accountNumber
    const url = `https://orderhistory-tst-af.azurewebsites.net/api/internal/webstore/orders/${orderId}?accountNumber=${encodeURIComponent(accountNumber)}&code=${encodeURIComponent(apiKey)}`

    const response = await fetch(url, {
      headers: {
        accept: "json/application",
      },
      cache: "no-store",
    })

    const rawResponse = await response.text()

    if (!response.ok) {
      return {
        data: null,
        error: `API Error: ${response.status} ${response.statusText}`,
        rawResponse,
      }
    }

    try {
      // Parse the response as the new WebstoreOrderResponse type
      const webstoreData = JSON.parse(rawResponse) as WebstoreOrderResponse

      // Map the webstore response to our OrderDetailsResponse format
      const mappedData: OrderDetailsResponse = {
        orderId: webstoreData.orderId,
        status: webstoreData.status,
        orderDate: webstoreData.orderDate,
        currencyCode: webstoreData.currencyCode,
        currencySign: webstoreData.currencySign,
        totalAmount: webstoreData.totalAmount,
        orderItems: webstoreData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          total: item.total,
          canReturn: item.canReturn !== false, // Default to true if not specified
          productDetails: {
            sizeEUR: item.productDetails?.sizeEUR || "N/A",
            sizeUK: item.productDetails?.sizeUK || "N/A",
            sizeUS: item.productDetails?.sizeUS || "N/A",
            sizeCN: item.productDetails?.sizeCN || "N/A",
            imageUrl: item.productDetails?.images?.[0]?.secureUrl || "",
            // Format the display size based on country code
            displaySize: getSizeByCountry(countryCode, {
              sizeEUR: item.productDetails?.sizeEUR,
              sizeUK: item.productDetails?.sizeUK,
              sizeUS: item.productDetails?.sizeUS,
              sizeCN: item.productDetails?.sizeCN,
            }),
          },
        })),
        customer: webstoreData.customer,
        shippingAddress: webstoreData.shippingAddress,
      }

      return {
        data: mappedData,
        error: null,
        rawResponse,
      }
    } catch (parseError) {
      console.error("Failed to parse API response:", parseError)
      return {
        data: null,
        error: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        rawResponse,
      }
    }
  } catch (error) {
    return {
      data: null,
      error: `Failed to fetch order details: ${error instanceof Error ? error.message : String(error)}`,
      rawResponse: JSON.stringify({ error: "Failed to fetch" }),
    }
  }
}
