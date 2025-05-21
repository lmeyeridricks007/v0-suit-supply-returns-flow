"use server"

// Define the return request interface
export interface CreateReturnRequest {
  orderId: string
  accountNumber: string
  countryCode: string
  returnItems: {
    orderLineId: string
    itemId: string
    quantity: number
    returnReason: string
  }[]
  returnMethod: "pickup" | "dropoff"
  dropOffLocationId?: string
  pickupAddress?: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}

// Define the return response interface based on the sample response
export interface CreateReturnResponse {
  success: boolean
  data: {
    OrderId: string
    ReturnStatus: string
    ConfirmedOrderTotal: number
    ReturnLabel?: {
      ReturnLabelDocId: string
    }[]
    OrderLine: {
      ItemId: string
      ItemDescription: string
      Quantity: number
      UnitPrice: number
      OrderLineTotal: number
      OrderLineAdditional: {
        ReturnReason: string
      }
    }[]
  }
  message?: string
  errors?: string[]
}

export async function createReturn(request: CreateReturnRequest): Promise<CreateReturnResponse> {
  console.log("Creating return with request:", request)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock successful response
  const response: CreateReturnResponse = {
    success: true,
    data: {
      OrderId: `RET_${Math.floor(Math.random() * 1000)}_${request.orderId}`,
      ReturnStatus: "Pending Return",
      ConfirmedOrderTotal: -379.0,
      ReturnLabel: [
        {
          ReturnLabelDocId: `omni-config-test${Math.floor(Math.random() * 1000000)}IUH${Math.floor(
            Math.random() * 100000,
          )}`,
        },
      ],
      OrderLine: request.returnItems.map((item) => ({
        ItemId: item.itemId,
        ItemDescription: "Black Lazio Tuxedo Jacket 46/ 36", // Mock description
        Quantity: item.quantity,
        UnitPrice: -379.0, // Mock price
        OrderLineTotal: -379.0 * item.quantity,
        OrderLineAdditional: {
          ReturnReason: item.returnReason,
        },
      })),
    },
  }

  return response
}
