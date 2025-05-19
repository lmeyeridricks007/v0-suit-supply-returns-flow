"use server"

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
      imageUrl: string
    }
    quantity: number
    total: number
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

export async function fetchOrderDetails(orderId: string): Promise<{
  data: OrderDetailsResponse | null
  error: string | null
  rawResponse: string
}> {
  try {
    const apiKey = "TZfbwt8pmhjKXc9Oh94u1IHP5qCgOQPl7CZ0Xr7xSFzGq//VLhG9KS=="
    const url = `https://orderhistory-tst-af.azurewebsites.net/api/internal/crm/orders/${orderId}?code=${encodeURIComponent(apiKey)}`

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

    const data = JSON.parse(rawResponse)

    return {
      data,
      error: null,
      rawResponse,
    }
  } catch (error) {
    return {
      data: null,
      error: `Failed to fetch order details: ${error instanceof Error ? error.message : String(error)}`,
      rawResponse: JSON.stringify({ error: "Failed to fetch" }),
    }
  }
}
