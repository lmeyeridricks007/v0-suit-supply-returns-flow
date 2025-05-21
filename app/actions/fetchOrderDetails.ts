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

// New interface to match the webstore API response
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
    productDetails: {
      sizeEUR: string
    }
    productCode: {
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
          productDetails: {
            sizeEUR: item.productDetails?.sizeEUR || "N/A",
            imageUrl: item.productCode?.images?.[0]?.secureUrl || "",
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
