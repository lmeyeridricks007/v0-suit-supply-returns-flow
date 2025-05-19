"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { BackButton } from "@/components/BackButton"
import { StepIndicator } from "@/components/StepIndicator"
import { SummaryItem } from "@/components/SummaryItem"
import { RotateCcw, Truck, MapPin, Info, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { ReturnReasonDropdown } from "@/components/ReturnReasonDropdown"
import { SimpleQuantitySelector } from "@/components/SimpleQuantitySelector"
import { ReturnMethodOption } from "@/components/ReturnMethodOption"
import { AddressCard } from "@/components/AddressCard"
import { PickupTimeSelector } from "@/components/PickupTimeSelector"
import { AddressForm } from "@/components/AddressForm"
import { DropoffLocationCard } from "@/components/DropoffLocationSelectionModal"
import { DropoffLocationSelectionModal } from "@/components/DropoffLocationSelectionModal"
import { OrderDetails } from "@/components/OrderDetails"
import { ReboundDetails } from "@/components/ReboundDetails"
import { fetchOrderDetails, type OrderDetailsResponse } from "@/app/actions/fetchOrderDetails"

const returnReasons = [
  "I've changed my mind",
  "Size too small",
  "Size too big",
  "Doesn't match description",
  "Defective item",
  "Wrong item received",
]

const pickupTimeOptions = [
  {
    id: "tomorrow",
    day: "Tomorrow",
    timeRange: "8:00 - 18:00",
    carrier: "UPS",
    cost: "Free",
  },
  {
    id: "dayafter",
    day: "Day after tomorrow",
    timeRange: "9:00 - 17:00",
    carrier: "DHL",
    cost: "Free",
  },
]

const dropoffLocations = [
  {
    id: "cigo",
    name: "Cigo Brouwer",
    address1: "Burgemeester De Vlugtlaan 178",
    address2: "1063BS Amsterdam",
    distance: "470 m",
    openingHours: "Opening hours",
  },
  {
    id: "primera",
    name: "Primera Plein 40-45",
    address1: "Joop van Weezelhof 18",
    address2: "1063MK Amsterdam",
    distance: "720 m",
  },
  {
    id: "vivant",
    name: "Vivant Prime",
    address1: "Slotermeerlaan 93",
    address2: "1064HA Amsterdam",
    distance: "800 m",
  },
]

type ReturnAction = "none" | "return"
type ReturnMethod = "pickup" | "dropoff"

export default function ReturnsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("OrderID") || "KLNL_8" // Default to KLNL_8 if not provided

  const [currentStep, setCurrentStep] = useState(1)
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>("")

  const [productStates, setProductStates] = useState<
    {
      selectedReason: string
      returnAction: ReturnAction
      returnQuantity: number
    }[]
  >([])

  const [returnMethod, setReturnMethod] = useState<ReturnMethod>("pickup")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showDropoffSelection, setShowDropoffSelection] = useState(false)
  const [selectedPickupTimeId, setSelectedPickupTimeId] = useState(pickupTimeOptions[0].id)
  const [selectedDropoffId, setSelectedDropoffId] = useState(dropoffLocations[0].id)
  const [dropoffSearchQuery, setDropoffSearchQuery] = useState("1063 GX")
  const [showNoLocations, setShowNoLocations] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(true)
  const [showReboundDetails, setShowReboundDetails] = useState(true)
  const [useSampleReboundData, setUseSampleReboundData] = useState(false)

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

  // Fetch order details when the component mounts or orderId changes
  useEffect(() => {
    async function getOrderDetails() {
      setLoading(true)
      const { data, error, rawResponse } = await fetchOrderDetails(orderId)
      setOrderDetails(data)
      setError(error)
      setRawResponse(rawResponse)

      // Initialize product states based on order items
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
  }, [orderId])

  // Calculate total refund amount
  const refundAmount = productStates.reduce((total, state, index) => {
    if (state.returnAction === "return" && orderDetails?.orderItems?.[index]) {
      return (
        total + (orderDetails.orderItems[index].total * state.returnQuantity) / orderDetails.orderItems[index].quantity
      )
    }
    return total
  }, 0)

  // Check if any product is selected for return
  const isAnyProductSelected = productStates.some((state) => state.returnAction !== "none")

  // Get selected dropoff location
  const selectedDropoff = dropoffLocations.find((location) => location.id === selectedDropoffId) || dropoffLocations[0]

  // Add/remove modal-open class to body when modal is shown/hidden
  useEffect(() => {
    if (showAddressForm || showDropoffSelection) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    // Cleanup on unmount
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

  const handleContinueClick = () => {
    if (currentStep === 1 && isAnyProductSelected) {
      setCurrentStep(2)
      window.scrollTo(0, 0)
    } else if (currentStep === 2) {
      // Navigate to confirmation page
      router.push("/returns/confirmation")
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

  const toggleNoLocations = () => {
    setShowNoLocations(!showNoLocations)
  }

  const toggleOrderDetails = () => {
    setShowOrderDetails(!showOrderDetails)
  }

  const toggleReboundDetails = () => {
    setShowReboundDetails(!showReboundDetails)
  }

  const getFormattedAddress = () => {
    // Use shipping address from order details if available
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

    // Fallback to default address
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

  // Get address for Rebound API
  const getReboundAddress = () => {
    if (orderDetails?.shippingAddress) {
      return {
        streetAddress: orderDetails.shippingAddress.addressLine1,
        city: orderDetails.shippingAddress.city,
        postalCode: orderDetails.shippingAddress.postalCode,
        countryCode: orderDetails.shippingAddress.countryCode || "GB",
      }
    }

    return {
      streetAddress: address.address,
      city: address.city,
      postalCode: address.postalCode,
      countryCode: "GB", // Default to GB as per the sample request
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Topbar />
      <BackButton href="/orders" label="Orders" />

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
        {/* Step 1: Select items */}
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
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="relative">
                        <ReturnReasonDropdown
                          selectedReason={productStates[index]?.selectedReason || ""}
                          onSelect={(reason) => selectReason(index, reason)}
                          reasons={returnReasons}
                        />
                      </div>

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

                            {/* Show quantity selector if product quantity > 1 and return is selected */}
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
                  <SummaryItem label="Delivery cost" value="Free" />
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

        {/* Step 2: Choose return method */}
        <div className="border-t border-gray-200">
          <StepIndicator number={2} isActive={currentStep === 2}>
            Choose a return method
          </StepIndicator>
        </div>

        {currentStep === 2 && (
          <div className="bg-white px-4 py-6">
            <h3 className="font-medium mb-4">Return options</h3>

            <ReturnMethodOption
              icon={<Truck size={24} />}
              title="Pickup"
              description="Schedule a pickup"
              selected={returnMethod === "pickup"}
              onClick={() => setReturnMethod("pickup")}
            />

            <ReturnMethodOption
              icon={<MapPin size={24} />}
              title="Drop-off point"
              description="Easy return near you"
              selected={returnMethod === "dropoff"}
              onClick={() => setReturnMethod("dropoff")}
            />

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

                <PickupTimeSelector
                  options={pickupTimeOptions}
                  selectedOptionId={selectedPickupTimeId}
                  onSelect={setSelectedPickupTimeId}
                />

                <div className="py-2 mt-6">
                  <SummaryItem label="Delivery cost" value="Free" />
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
                  <button className="w-full py-3 rounded bg-gray-900 text-white" onClick={handleContinueClick}>
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
                  </div>
                </div>

                <h3 className="font-medium mb-4">Drop-off locations</h3>

                {showNoLocations ? (
                  <div className="border border-gray-200 rounded-md p-8 mb-6 text-center text-gray-500">
                    No locations found in your area
                  </div>
                ) : (
                  <>
                    {dropoffLocations.map((location) => (
                      <DropoffLocationCard
                        key={location.id}
                        name={location.name}
                        address1={location.address1}
                        address2={location.address2}
                        distance={location.distance}
                        openingHours={location.openingHours}
                        selected={selectedDropoffId === location.id}
                        onClick={() => setSelectedDropoffId(location.id)}
                      />
                    ))}

                    <button
                      className="w-full py-3 border border-gray-200 rounded-md mb-6 text-center"
                      onClick={() => setShowDropoffSelection(true)}
                    >
                      Select a different location
                    </button>
                  </>
                )}

                <div className="py-2">
                  <SummaryItem label="Delivery cost" value="Free" />
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
                    disabled={showNoLocations}
                  >
                    Continue
                  </button>
                </div>

                {/* For testing purposes */}
                <button className="mt-4 text-xs text-gray-400 underline" onClick={toggleNoLocations}>
                  Toggle no locations view
                </button>
              </>
            )}
          </div>
        )}

        {/* Order Details Section */}
        <div className="border-t border-gray-200 mt-6">
          <button onClick={toggleOrderDetails} className="w-full flex items-center justify-between p-4 text-left">
            <h3 className="font-medium">Order Details</h3>
            {showOrderDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showOrderDetails && (
            <div className="p-4">
              <OrderDetails initialOrderId={orderId} />
            </div>
          )}
        </div>

        {/* Rebound Details Section */}
        <div className="border-t border-gray-200 mt-6">
          <button onClick={toggleReboundDetails} className="w-full flex items-center justify-between p-4 text-left">
            <h3 className="font-medium">Rebound Details</h3>
            {showReboundDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showReboundDetails && (
            <div className="p-4">
              <div className="mb-4 flex items-center justify-end">
                <label className="flex items-center text-sm text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSampleReboundData}
                    onChange={() => setUseSampleReboundData(!useSampleReboundData)}
                    className="mr-2 h-4 w-4"
                  />
                  Use sample data (for testing)
                </label>
              </div>
              <ReboundDetails address={getReboundAddress()} useSampleData={useSampleReboundData} />
            </div>
          )}
        </div>
      </div>

      {showAddressForm && (
        <AddressForm initialAddress={address} onSave={handleSaveAddress} onCancel={() => setShowAddressForm(false)} />
      )}

      {showDropoffSelection && (
        <DropoffLocationSelectionModal
          locations={dropoffLocations}
          onSelect={handleSelectDropoff}
          onClose={() => setShowDropoffSelection(false)}
        />
      )}
    </div>
  )
}
