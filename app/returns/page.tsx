"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { BackButton } from "@/components/BackButton"
import { StepIndicator } from "@/components/StepIndicator"
import { SummaryItem } from "@/components/SummaryItem"
import { RotateCcw, Truck, MapPin, Info, Loader2, Calendar, AlertCircle, Map, ShoppingBag, XCircle } from "lucide-react"
import { ReturnReasonDropdown } from "@/components/ReturnReasonDropdown"
import Link from "next/link"
import { SimpleQuantitySelector } from "@/components/SimpleQuantitySelector"
import { ReturnMethodOption } from "@/components/ReturnMethodOption"
import { AddressCard } from "@/components/AddressCard"
import { AddressForm } from "@/components/AddressForm"
import { DropoffLocationCard } from "@/components/DropoffLocationSelectionModal"
import { DropoffLocationSelectionModal } from "@/components/DropoffLocationSelectionModal"
import { fetchOrderDetails, type OrderDetailsResponse } from "@/app/actions/fetchOrderDetails"
import { fetchReboundData, type ReboundApiResponse } from "@/app/actions/fetchReboundData"
import { fetchDropOffLocations, type DropOffLocationsResponse } from "@/app/actions/fetchDropOffLocations"
import { DropOffLocationsMap } from "@/components/DropOffLocationsMap"
import { createReturn, type CreateReturnRequest } from "@/app/actions/createReturn"
import { ReturnProcessingScreen } from "@/components/ReturnProcessingScreen"

const returnReasons = [
  "I've changed my mind",
  "Size too small",
  "Size too big",
  "Doesn't match description",
  "Defective item",
  "Wrong item received",
]

const getNextDayDate = (): string => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

type ReturnAction = "none" | "return"
type ReturnMethod = "pickup" | "dropoff" | null

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000 // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in meters
  return Math.round(distance)
}

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180)
}

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters} m`
  } else {
    return `${(meters / 1000).toFixed(1)} km`
  }
}

export default function ReturnsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("OrderID") || "KLNL_8" // Get OrderID from query string
  const countryCode = searchParams.get("countryCode") || "ES" // Get countryCode from query string
  const accountNumber = searchParams.get("accountNumber") || "SF007353795"

  const [currentStep, setCurrentStep] = useState(1)
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>("")
  const [orderNotFound, setOrderNotFound] = useState(false)
  const [isProcessingReturn, setIsProcessingReturn] = useState(false)

  const [productStates, setProductStates] = useState<
    {
      selectedReason: string
      returnAction: ReturnAction
      returnQuantity: number
    }[]
  >([])

  const [reboundData, setReboundData] = useState<ReboundApiResponse | null>(null)
  const [reboundLoading, setReboundLoading] = useState(true)
  const [reboundError, setReboundError] = useState<string | null>(null)

  const [dropOffLocationsData, setDropOffLocationsData] = useState<DropOffLocationsResponse | null>(null)
  const [dropOffLocationsLoading, setDropOffLocationsLoading] = useState(false)
  const [dropOffLocationsError, setDropOffLocationsError] = useState<string | null>(null)

  const [returnMethod, setReturnMethod] = useState<ReturnMethod>(null)
  const [showMap, setShowMap] = useState(true)
  const [selectedDropoffId, setSelectedDropoffId] = useState<string | null>(null)

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showDropoffSelection, setShowDropoffSelection] = useState(false)
  const [dropoffSearchQuery, setDropoffSearchQuery] = useState("28014") // Default to 28014
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(dropoffSearchQuery)
  const [showNoLocations, setShowNoLocations] = useState(false)

  const [address, setAddress] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "Johndoe@gmail.com",
    phone: "6 12345678",
    address: "Lou Jansenplein 18, 3",
    city: "Amsterdam",
    postalCode: "1063 GX",
    country: "The Netherlands",
  })

  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null)

  useEffect(() => {
    if (dropoffSearchQuery.length < 4) return

    const handler = setTimeout(() => {
      setDebouncedSearchQuery(dropoffSearchQuery)
    }, 1000) // 1 second delay

    return () => {
      clearTimeout(handler)
    }
  }, [dropoffSearchQuery])

  useEffect(() => {
    async function getOrderDetails() {
      setLoading(true)
      setOrderNotFound(false)
      const { data, error, rawResponse } = await fetchOrderDetails(orderId, accountNumber, countryCode)
      setOrderDetails(data)
      setError(error)
      setRawResponse(rawResponse)

      if (!data || error) {
        setOrderNotFound(true)
      }

      if (data && data.orderItems) {
        setProductStates(
          data.orderItems.map(() => ({
            selectedReason: "",
            returnAction: "none" as ReturnAction,
            returnQuantity: 1,
          })),
        )
      }

      setLoading(false)
    }

    getOrderDetails()
  }, [orderId, accountNumber, countryCode])

  useEffect(() => {
    async function fetchReboundOptions() {
      setReboundLoading(true)
      const addressData = getReboundAddress()
      const { data, error } = await fetchReboundData(addressData, false, countryCode)
      setReboundData(data)
      setReboundError(error)
      setReboundLoading(false)

      if (data && data.content && data.content.length > 0) {
        const hasPickup = data.content.some((option) => option.type === "PICK_UP")
        if (hasPickup) {
          setReturnMethod("pickup")
        } else if (data.content.some((option) => option.type === "DROP_OFF")) {
          setReturnMethod("dropoff")
        }
      }
    }

    fetchReboundOptions()
  }, [countryCode])

  const fetchDropOffPoints = useCallback(async () => {
    if (returnMethod !== "dropoff" || debouncedSearchQuery.length < 4) return

    setDropOffLocationsLoading(true)
    const { data, error } = await fetchDropOffLocations(
      {
        postalCode: debouncedSearchQuery,
        countryCode: countryCode,
        searchRadius: 1,
        referenceId: "1019",
      },
      false,
    )
    setDropOffLocationsData(data)
    setDropOffLocationsError(error)
    setDropOffLocationsLoading(false)

    if (data && data.dropOffPointList && data.dropOffPointList.length > 0) {
      setSelectedDropoffId("0")
    }
  }, [returnMethod, debouncedSearchQuery, countryCode])

  useEffect(() => {
    fetchDropOffPoints()
  }, [fetchDropOffPoints])

  const refundAmount = productStates.reduce((total, state, index) => {
    if (state.returnAction === "return" && orderDetails?.orderItems?.[index]) {
      return (
        total + (orderDetails.orderItems[index].total * state.returnQuantity) / orderDetails.orderItems[index].quantity
      )
    }
    return total
  }, 0)

  const isAnyProductSelected = productStates.some((state) => state.returnAction !== "none")

  const returnedItems = useMemo(() => {
    if (!orderDetails?.orderItems) return []

    return orderDetails.orderItems
      .filter((_, index) => productStates[index]?.returnAction === "return")
      .map((item, index) => {
        const stateIndex = orderDetails.orderItems.findIndex((orderItem) => orderItem === item)
        return {
          ...item,
          returnQuantity: productStates[stateIndex]?.returnQuantity || 1,
          returnReason: productStates[stateIndex]?.selectedReason || "",
        }
      })
  }, [orderDetails, productStates])

  useEffect(() => {
    if (showAddressForm || showDropoffSelection) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [showAddressForm, showDropoffSelection])

  const selectReason = (index: number, reason: string) => {
    setProductStates((prev) => prev.map((state, i) => (i === index ? { ...state, selectedReason: reason } : state)))
  }

  const handleReturnClick = (index: number) => {
    setProductStates((prev) =>
      prev.map((state, i) =>
        i === index
          ? {
              ...state,
              returnAction: state.returnAction === "return" ? "none" : "return",
            }
          : state,
      ),
    )
  }

  const handleQuantityChange = (index: number, increment: boolean) => {
    setProductStates((prev) =>
      prev.map((state, i) => {
        if (i !== index) return state

        const currentQty = state.returnQuantity
        const maxQty = orderDetails?.orderItems?.[index]?.quantity || 1

        if (increment && currentQty < maxQty) {
          return { ...state, returnQuantity: currentQty + 1 }
        } else if (!increment && currentQty > 1) {
          return { ...state, returnQuantity: currentQty - 1 }
        }

        return state
      }),
    )
  }

  const handleContinueClick = async () => {
    if (currentStep === 1 && isAnyProductSelected) {
      setCurrentStep(2)
      window.scrollTo(0, 0)
    } else if (currentStep === 2) {
      // Create return request
      setIsProcessingReturn(true)

      try {
        // Prepare return items
        const returnItems = returnedItems.map((item, index) => {
          const stateIndex = orderDetails?.orderItems?.findIndex((orderItem) => orderItem === item) || 0
          return {
            orderLineId: index.toString(),
            itemId: item.productDetails?.imageUrl?.split("/").pop() || `item-${index}`,
            quantity: productStates[stateIndex]?.returnQuantity || 1,
            returnReason: productStates[stateIndex]?.selectedReason || "",
          }
        })

        // Create return request
        const request: CreateReturnRequest = {
          orderId,
          accountNumber,
          countryCode,
          returnItems,
          returnMethod: returnMethod || "pickup",
        }

        // Add pickup address or dropoff location if applicable
        if (returnMethod === "pickup") {
          request.pickupAddress = {
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
          }
        } else if (returnMethod === "dropoff" && selectedDropoffId) {
          request.dropOffLocationId = selectedDropoffId
        }

        // Call the API
        const response = await createReturn(request)

        // Store return data in localStorage
        localStorage.setItem("returnedItems", JSON.stringify(returnedItems))
        localStorage.setItem("returnResponse", JSON.stringify(response))

        // Redirect to confirmation page
        router.push(
          `/returns/confirmation?OrderID=${orderId}&countryCode=${countryCode}&accountNumber=${accountNumber}`,
        )
      } catch (error) {
        console.error("Error creating return:", error)
        setIsProcessingReturn(false)
        // Show error message
        alert("There was an error processing your return. Please try again.")
      }
    }
  }

  const handleEditAddress = () => {
    setShowAddressForm(true)
  }

  const handleSaveAddress = (newAddress: typeof address) => {
    setAddress(newAddress)
    setShowAddressForm(false)
  }

  const handleSelectDropoff = (locationId: string) => {
    setSelectedDropoffId(locationId)
    setShowDropoffSelection(false)
  }

  const toggleMap = () => {
    setShowMap(!showMap)
  }

  const toggleNoLocations = () => {
    setShowNoLocations(!showNoLocations)
  }

  const getFormattedAddress = () => {
    if (orderDetails?.shippingAddress) {
      const { firstName, lastName, addressLine1, addressLine2, city, country, postalCode } =
        orderDetails.shippingAddress
      return {
        name: `${firstName} ${lastName}`,
        address1: addressLine1,
        address2: `${postalCode} ${city}`,
        country: country,
      }
    }

    return {
      name: `${address.firstName} ${address.lastName}`,
      address1: address.address,
      address2: `${address.postalCode} ${address.city}`,
      country: address.country,
    }
  }

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

  const getReboundAddress = () => {
    if (orderDetails?.shippingAddress) {
      return {
        streetAddress: orderDetails.shippingAddress.addressLine1,
        city: orderDetails.shippingAddress.city,
        postalCode: orderDetails.shippingAddress.postalCode,
        countryCode: countryCode,
      }
    }

    return {
      streetAddress: address.address,
      city: address.city,
      postalCode: address.postalCode,
      countryCode: countryCode,
    }
  }

  const hasPickupOption = useMemo(() => {
    if (!reboundData || !reboundData.content) return false
    return reboundData.content.some((option) => option.type === "PICK_UP")
  }, [reboundData])

  const hasDropoffOption = useMemo(() => {
    if (!reboundData || !reboundData.content) return false
    return reboundData.content.some((option) => option.type === "DROP_OFF")
  }, [reboundData])

  const selectedDropoffLocation = useMemo(() => {
    if (!dropOffLocationsData || !dropOffLocationsData.dropOffPointList || !selectedDropoffId) return null
    return (
      dropOffLocationsData.dropOffPointList.find((location, index) => index.toString() === selectedDropoffId) || null
    )
  }, [dropOffLocationsData, selectedDropoffId])

  const allDropOffLocations = useMemo(() => {
    if (!dropOffLocationsData || !dropOffLocationsData.dropOffPointList) return []
    return dropOffLocationsData.dropOffPointList
  }, [dropOffLocationsData])

  const locationsWithDistances = useMemo(() => {
    if (!dropOffLocationsData?.customerStreetGeoLocation || !allDropOffLocations.length) return []

    return allDropOffLocations.map((location) => {
      let distance = 0
      if (location.geoLocation) {
        distance = calculateDistance(
          dropOffLocationsData.customerStreetGeoLocation.lat,
          dropOffLocationsData.customerStreetGeoLocation.lng,
          location.geoLocation.lat,
          location.geoLocation.lng,
        )
      }
      return {
        ...location,
        distanceInMeters: distance,
        formattedDistance: formatDistance(distance),
      }
    })
  }, [allDropOffLocations, dropOffLocationsData])

  const getDeliveryCost = () => {
    if (!reboundData || !reboundData.content) return "Free"

    const selectedMethod = reboundData.content.find((option) => {
      if (returnMethod === "pickup") return option.type === "PICK_UP"
      if (returnMethod === "dropoff") return option.type === "DROP_OFF"
      return false
    })

    if (!selectedMethod) return "Free"

    if (selectedMethod.price.amount === 0) return "Free"
    return `${selectedMethod.price.amount} ${selectedMethod.price.currency || "EUR"}`
  }

  const handleLocationSelect = (locationId: string) => {
    setSelectedDropoffId(locationId)
    setFocusedLocationId(locationId)

    const locationElement = document.getElementById(`location-${locationId}`)
    if (locationElement) {
      locationElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleMapLocationSelected = (locationId: string) => {
    handleLocationSelect(locationId)
  }

  if (orderNotFound && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Topbar />
        <BackButton href={`/orders?countryCode=${countryCode}&accountNumber=${accountNumber}`} label="Orders" />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="bg-gray-100 rounded-full p-6 mb-6">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-medium mb-4 text-center">Order Not Found</h1>
          <p className="text-gray-600 text-center mb-8">
            We couldn't find the order you're looking for. The order may have been removed or the ID might be incorrect.
          </p>
          <Link
            href={`/orders?countryCode=${countryCode}&accountNumber=${accountNumber}`}
            className="px-6 py-3 bg-gray-900 text-white rounded-md"
          >
            Return to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isProcessingReturn && <ReturnProcessingScreen />}

      <Topbar />
      <BackButton href={`/orders?countryCode=${countryCode}&accountNumber=${accountNumber}`} label="Orders" />

      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-medium mb-2">Return products</h1>
        <p className="text-gray-600 text-sm">Request a refund for your returned product.</p>
        {orderDetails && (
          <p className="text-gray-600 text-sm mt-2">
            Order #{orderDetails.orderId} - {formatDate(orderDetails.orderDate)}
          </p>
        )}
      </div>

      <div className="flex-grow flex flex-col">
        <div className="border-t border-gray-200">
          <div className="flex justify-between items-center">
            <StepIndicator number={1} isActive={currentStep === 1}>
              Select items to return
            </StepIndicator>
            {currentStep === 2 && (
              <button onClick={() => setCurrentStep(1)} className="pr-4 text-sm text-gray-700 underline">
                Edit
              </button>
            )}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="bg-white px-4 py-6">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : error ? (
              <div className="border border-red-200 rounded-md p-4 bg-red-50">
                <h3 className="font-medium text-red-700 mb-2">Error loading order details</h3>
                <p className="text-red-600">{error}</p>
              </div>
            ) : orderDetails && orderDetails.orderItems ? (
              orderDetails.orderItems.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="p-4">
                      <div className="flex gap-4">
                        <div className="w-[132px] h-[132px] bg-gray-100 flex-shrink-0">
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
                        <div className="flex flex-col justify-between flex-grow">
                          <div>
                            <h3 className="text-base font-medium">{item.name}</h3>
                            <div className="text-sm text-gray-600 mt-4">
                              <p>Qty. {item.quantity}</p>
                              <p>Size {item.productDetails?.displaySize || "N/A"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {orderDetails.currencySign || "€"}
                              {item.total}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      {item.canReturn !== false ? (
                        <div className="relative">
                          <ReturnReasonDropdown
                            selectedReason={productStates[index]?.selectedReason || ""}
                            onSelect={(reason) => selectReason(index, reason)}
                            reasons={returnReasons}
                          />

                          {productStates[index]?.selectedReason && (
                            <div className="mt-4">
                              <div className="flex gap-2">
                                <button
                                  className={`w-full py-3 border rounded flex items-center justify-center gap-2 ${
                                    productStates[index]?.returnAction === "return"
                                      ? "bg-gray-100 border-gray-400"
                                      : "border-gray-200"
                                  }`}
                                  onClick={() => handleReturnClick(index)}
                                >
                                  <RotateCcw size={16} />
                                  <span>Return</span>
                                </button>

                                {item.quantity > 1 && productStates[index]?.returnAction === "return" && (
                                  <SimpleQuantitySelector
                                    quantity={productStates[index]?.returnQuantity || 1}
                                    onDecrement={() => handleQuantityChange(index, false)}
                                    onIncrement={() => handleQuantityChange(index, true)}
                                    maxQuantity={item.quantity}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200">
                          <div className="flex items-center text-gray-500">
                            <XCircle size={16} className="mr-2" />
                            <span>This item cannot be returned</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-gray-500">No items found in this order</p>
              </div>
            )}

            {!loading && !error && orderDetails && (
              <>
                <div className="px-4 py-2">
                  <SummaryItem label="Delivery cost" value={getDeliveryCost()} />
                  <SummaryItem
                    label={
                      <div className="flex items-center">
                        Refund amount <span className="text-xs text-gray-500 ml-1">Incl. vat</span>
                      </div>
                    }
                    value={`${orderDetails.currencySign || "€"}${refundAmount.toFixed(2)}`}
                    isTotal={true}
                  />
                </div>

                <div className="px-4 mt-4">
                  <button
                    className={`w-full py-3 rounded ${
                      isAnyProductSelected ? "bg-gray-900 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isAnyProductSelected}
                    onClick={handleContinueClick}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="border-t border-gray-200">
          <StepIndicator number={2} isActive={currentStep === 2}>
            Choose a return method
          </StepIndicator>
        </div>

        {currentStep === 2 && (
          <div className="bg-white px-4 py-6">
            <h3 className="font-medium mb-4">Return options</h3>

            {reboundLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : reboundError ? (
              <div className="border border-red-200 rounded-md p-4 bg-red-50 mb-4">
                <div className="flex items-center text-red-700 mb-2">
                  <AlertCircle size={20} className="mr-2" />
                  <h3 className="font-medium">Error loading return options</h3>
                </div>
                <p className="text-red-600">{reboundError}</p>
              </div>
            ) : (
              <>
                {hasPickupOption && (
                  <ReturnMethodOption
                    icon={<Truck size={24} />}
                    title="Pick up"
                    description="Schedule a pickup"
                    selected={returnMethod === "pickup"}
                    onClick={() => setReturnMethod("pickup")}
                  />
                )}

                {hasDropoffOption && (
                  <ReturnMethodOption
                    icon={<MapPin size={24} />}
                    title="Drop-off point"
                    description="Easy return near you"
                    selected={returnMethod === "dropoff"}
                    onClick={() => setReturnMethod("dropoff")}
                  />
                )}

                {!hasPickupOption && !hasDropoffOption && (
                  <div className="border border-gray-200 rounded-md p-4 text-center text-gray-500 mb-4">
                    No return options available for your location
                  </div>
                )}
              </>
            )}

            <button className="text-sm text-gray-700 underline mb-6">Contact customer service</button>

            {returnMethod === "pickup" && (
              <>
                <div className="flex items-center mb-2">
                  <h3 className="font-medium">Address</h3>
                  <Info size={16} className="ml-2 text-gray-500" />
                </div>

                <AddressCard
                  name={getFormattedAddress().name}
                  address1={getFormattedAddress().address1}
                  address2={getFormattedAddress().address2}
                  country={getFormattedAddress().country}
                  onEdit={handleEditAddress}
                />

                <h3 className="font-medium mb-4 mt-6">Pick up time</h3>

                <div className="border border-gray-200 rounded-md p-4 mb-4">
                  <div className="flex items-start">
                    <Calendar size={20} className="mr-3 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <h4 className="font-medium">{getNextDayDate()}</h4>
                      <p className="text-sm text-gray-600 mt-1">9:00 AM - 5:00 PM</p>
                      <p className="text-sm text-gray-600 mt-1">By Correos</p>
                      <p className="text-sm text-gray-600 mt-3">{getDeliveryCost()}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2 mt-6">
                  <SummaryItem label="Delivery cost" value={getDeliveryCost()} />
                  <SummaryItem
                    label={
                      <div className="flex items-center">
                        Refund amount <span className="text-xs text-gray-500 ml-1">Incl. vat</span>
                      </div>
                    }
                    value={orderDetails ? `${orderDetails.currencySign || "€"}${refundAmount.toFixed(2)}` : `€0.00`}
                    isTotal={true}
                  />
                </div>

                <div className="mt-4">
                  <button
                    className="w-full py-3 rounded bg-gray-900 text-white"
                    onClick={handleContinueClick}
                    disabled={isProcessingReturn}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {returnMethod === "dropoff" && (
              <>
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Search for locations</h3>
                  <div className="relative">
                    <label htmlFor="dropoffSearch" className="block text-sm text-gray-500 mb-2">
                      Address or postcode
                    </label>
                    <input
                      type="text"
                      id="dropoffSearch"
                      value={dropoffSearchQuery}
                      onChange={(e) => setDropoffSearchQuery(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-md"
                    />
                    {dropoffSearchQuery.length < 4 && (
                      <p className="text-xs text-gray-500 mt-1">Please enter at least 4 characters</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Drop-off locations</h3>
                  <button
                    onClick={toggleMap}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-md text-sm"
                  >
                    <Map size={16} />
                    {showMap ? "Hide Map" : "Show Map"}
                  </button>
                </div>

                {dropOffLocationsLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : dropOffLocationsError ? (
                  <div className="border border-red-200 rounded-md p-4 bg-red-50 mb-4">
                    <div className="flex items-center text-red-700 mb-2">
                      <AlertCircle size={20} className="mr-2" />
                      <h3 className="font-medium">Error loading drop-off locations</h3>
                    </div>
                    <p className="text-red-600">{dropOffLocationsError}</p>
                  </div>
                ) : locationsWithDistances.length === 0 ? (
                  <div className="border border-gray-200 rounded-md p-8 mb-6 text-center text-gray-500">
                    No locations found in your area
                  </div>
                ) : (
                  <>
                    {showMap && dropOffLocationsData && dropOffLocationsData.customerStreetGeoLocation && (
                      <div className="mb-6">
                        <DropOffLocationsMap
                          customerLocation={dropOffLocationsData.customerStreetGeoLocation}
                          dropOffLocations={allDropOffLocations.map((location) => ({
                            name: location.name,
                            address: location.address,
                            geoLocation: location.geoLocation,
                            openNow: location.openNow,
                            weekdayDescriptions: location.weekdayDescriptions,
                          }))}
                          height="245px"
                          zoom={16}
                          focusedLocationId={focusedLocationId}
                          onLocationSelected={handleMapLocationSelected}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Blue pin: Your location | Red pins: Drop-off points
                        </p>
                      </div>
                    )}

                    <div className="border border-gray-200 rounded-md mb-6 overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto">
                        {locationsWithDistances.map((location, index) => {
                          const addressParts = location.address.split(" ")
                          const city = addressParts[0] || ""
                          const postalCode = addressParts[1] || ""
                          const region = addressParts[2] || ""
                          const country = addressParts[3] || ""

                          return (
                            <div
                              key={index}
                              className={index > 0 ? "border-t border-gray-200" : ""}
                              id={`location-${index.toString()}`}
                            >
                              <DropoffLocationCard
                                name={location.name}
                                address1={`${city} ${postalCode}`}
                                address2={`${region} ${country}`}
                                distance={location.formattedDistance}
                                selected={selectedDropoffId === index.toString()}
                                onClick={() => handleLocationSelect(index.toString())}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <button
                      className="w-full py-3 border border-gray-200 rounded-md mb-6 text-center"
                      onClick={() => setShowDropoffSelection(true)}
                    >
                      Select a different location
                    </button>
                  </>
                )}

                <div className="py-2">
                  <SummaryItem label="Delivery cost" value={getDeliveryCost()} />
                  <SummaryItem
                    label={
                      <div className="flex items-center">
                        Refund amount <span className="text-xs text-gray-500 ml-1">Incl. vat</span>
                      </div>
                    }
                    value={orderDetails ? `${orderDetails.currencySign || "€"}${refundAmount.toFixed(2)}` : `€0.00`}
                    isTotal={true}
                  />
                </div>

                <div className="mt-4">
                  <button
                    className="w-full py-3 rounded bg-gray-900 text-white"
                    onClick={handleContinueClick}
                    disabled={showNoLocations || isProcessingReturn}
                  >
                    Continue
                  </button>
                </div>

                <button className="mt-4 text-xs text-gray-400 underline" onClick={toggleNoLocations}>
                  Toggle no locations view
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showAddressForm && (
        <AddressForm initialAddress={address} onSave={handleSaveAddress} onCancel={() => setShowAddressForm(false)} />
      )}

      {showDropoffSelection && dropOffLocationsData && (
        <DropoffLocationSelectionModal
          locations={locationsWithDistances.map((location, index) => {
            const addressParts = location.address.split(" ")
            const city = addressParts[0] || ""
            const postalCode = addressParts[1] || ""
            const region = addressParts[2] || ""
            const country = addressParts[3] || ""

            return {
              id: index.toString(),
              name: location.name,
              address1: `${city} ${postalCode}`,
              address2: `${region} ${country}`,
              distance: location.formattedDistance,
            }
          })}
          onSelect={handleSelectDropoff}
          onClose={() => setShowDropoffSelection(false)}
        />
      )}
    </div>
  )
}
