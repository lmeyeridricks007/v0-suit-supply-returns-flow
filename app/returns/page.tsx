"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { BackButton } from "@/components/BackButton"
import { StepIndicator } from "@/components/StepIndicator"
import { SummaryItem } from "@/components/SummaryItem"
import { RotateCcw, Truck, Store, MapPin, Info } from "lucide-react"
import { ReturnReasonDropdown } from "@/components/ReturnReasonDropdown"
import { SimpleQuantitySelector } from "@/components/SimpleQuantitySelector"
import { ReturnMethodOption } from "@/components/ReturnMethodOption"
import { AddressCard } from "@/components/AddressCard"
import { PickupTimeSelector } from "@/components/PickupTimeSelector"
import { AddressForm } from "@/components/AddressForm"
import { StoreSelectionModal } from "@/components/StoreSelectionModal"
import { StoreCard } from "@/components/StoreCard"
import { DropoffLocationCard } from "@/components/DropoffLocationSelectionModal"
import { DropoffLocationSelectionModal } from "@/components/DropoffLocationSelectionModal"

// Sample data with direct image URLs
const products = [
  {
    id: 1,
    name: "Purple Crewneck",
    image:
      "https://cdn.suitsupply.com/image/upload/w_210,h_257,c_lfill,g_center,b_rgb:efefef,f_auto//suitsupply/campaigns/ss25/quicklinks/knitwear/crewnecks_v-necks.jpg",
    quantity: 2,
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
    price: 159,
  },
]

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

const storeLocations = [
  {
    id: "amsterdam",
    name: "Amsterdam",
    address1: "Willemsparkweg 37-41",
    address2: "1071 GP Amsterdam",
    distance: "4.79 km",
    openingHours: "Opening hours",
  },
  {
    id: "haarlem",
    name: "Haarlem",
    address1: "Zijlstraat 70-74",
    address2: "2011 TR Haarlem",
    distance: "12.72 km",
  },
  {
    id: "hoofddorp",
    name: "Hoofddorp A4",
    address1: "Zijlstraat 70",
    address2: "2011 TR Haarlem",
    distance: "16.50 km",
  },
  {
    id: "laren",
    name: "Laren",
    address1: "Burgemeester van Nispen van Sevenaerstraat 2",
    address2: "1251 KH Laren",
    distance: "30.80 km",
  },
  {
    id: "leiden",
    name: "Leiden",
    address1: "Aalmarkt 8",
    address2: "2311 EC Leiden",
    distance: "33.58 km",
  },
  {
    id: "utrecht",
    name: "Utrecht A2",
    address1: "Proostwetering 80",
    address2: "3543 AJ Utrecht",
    distance: "33.78 km",
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
type ReturnMethod = "pickup" | "store" | "dropoff"

export default function ReturnsPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [productStates, setProductStates] = useState(
    products.map(() => ({
      selectedReason: "",
      returnAction: "none" as ReturnAction,
      returnQuantity: 1,
    })),
  )

  const [returnMethod, setReturnMethod] = useState<ReturnMethod>("pickup")
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showStoreSelection, setShowStoreSelection] = useState(false)
  const [showDropoffSelection, setShowDropoffSelection] = useState(false)
  const [selectedPickupTimeId, setSelectedPickupTimeId] = useState(pickupTimeOptions[0].id)
  const [selectedStoreId, setSelectedStoreId] = useState(storeLocations[0].id)
  const [selectedDropoffId, setSelectedDropoffId] = useState(dropoffLocations[0].id)
  const [storeSearchQuery, setStoreSearchQuery] = useState("1063 GX")
  const [dropoffSearchQuery, setDropoffSearchQuery] = useState("1063 GX")
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

  // Calculate total refund amount
  const refundAmount = productStates.reduce((total, state, index) => {
    if (state.returnAction === "return") {
      return total + products[index].price * state.returnQuantity
    }
    return total
  }, 0)

  // Check if any product is selected for return
  const isAnyProductSelected = productStates.some((state) => state.returnAction !== "none")

  // Get selected store
  const selectedStore = storeLocations.find((store) => store.id === selectedStoreId) || storeLocations[0]

  // Get selected dropoff location
  const selectedDropoff = dropoffLocations.find((location) => location.id === selectedDropoffId) || dropoffLocations[0]

  // Add/remove modal-open class to body when modal is shown/hidden
  useEffect(() => {
    if (showAddressForm || showStoreSelection || showDropoffSelection) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [showAddressForm, showStoreSelection, showDropoffSelection])

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
        const maxQty = products[index].quantity

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

  const handleAddNewAddress = () => {
    setShowAddressForm(true)
  }

  const handleSaveAddress = (newAddress: typeof address) => {
    setAddress(newAddress)
    setShowAddressForm(false)
  }

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId)
    setShowStoreSelection(false)
  }

  const handleSelectDropoff = (locationId: string) => {
    setSelectedDropoffId(locationId)
    setShowDropoffSelection(false)
  }

  const toggleNoLocations = () => {
    setShowNoLocations(!showNoLocations)
  }

  const getFormattedAddress = () => {
    return {
      name: `${address.firstName} ${address.lastName}`,
      address1: address.address,
      address2: `${address.postalCode} ${address.city}`,
      country: address.country,
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Topbar />
      <BackButton href="/orders" label="Orders" />

      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-medium mb-2">Return products</h1>
        <p className="text-gray-600 text-sm">Request a refund for your returned product.</p>
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
            {products.map((product, index) => (
              <div key={product.id} className="mb-4">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className="w-[132px] h-[132px] bg-gray-100 flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="text-base font-medium">{product.name}</h3>
                          <div className="text-sm text-gray-600 mt-4">
                            <p>Qty. {product.quantity}</p>
                            <p>Size {product.size}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{product.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="relative">
                      <ReturnReasonDropdown
                        selectedReason={productStates[index].selectedReason}
                        onSelect={(reason) => selectReason(index, reason)}
                        reasons={returnReasons}
                      />
                    </div>

                    {productStates[index].selectedReason && (
                      <div className="mt-4">
                        <div className="flex gap-2">
                          <button
                            className={`w-full py-3 border rounded flex items-center justify-center gap-2 ${
                              productStates[index].returnAction === "return"
                                ? "bg-gray-100 border-gray-400"
                                : "border-gray-200"
                            }`}
                            onClick={() => handleReturnClick(index)}
                          >
                            <RotateCcw size={16} />
                            <span>Return</span>
                          </button>

                          {/* Show quantity selector if product quantity > 1 and return is selected */}
                          {product.quantity > 1 && productStates[index].returnAction === "return" && (
                            <SimpleQuantitySelector
                              quantity={productStates[index].returnQuantity}
                              onDecrement={() => handleQuantityChange(index, false)}
                              onIncrement={() => handleQuantityChange(index, true)}
                              maxQuantity={product.quantity}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="px-4 py-2">
              <SummaryItem label="Delivery cost" value="Free" />
              <SummaryItem
                label={
                  <div className="flex items-center">
                    Refund amount <span className="text-xs text-gray-500 ml-1">Incl. vat</span>
                  </div>
                }
                value={`€${refundAmount}`}
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
            <h3 className="font-medium mb-4">Pick up options</h3>

            <ReturnMethodOption
              icon={<Truck size={24} />}
              title="Pickup"
              description="Schedule a pickup"
              selected={returnMethod === "pickup"}
              onClick={() => setReturnMethod("pickup")}
            />

            <ReturnMethodOption
              icon={<Store size={24} />}
              title="Return in store"
              description="Drop-off at any Suitsupply store"
              selected={returnMethod === "store"}
              onClick={() => setReturnMethod("store")}
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

                <button
                  className="w-full py-3 border border-gray-200 rounded-md mb-6 text-center"
                  onClick={handleAddNewAddress}
                >
                  Select a different address
                </button>

                <h3 className="font-medium mb-4">Pick up time</h3>

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
                    value={`€${refundAmount}`}
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

            {returnMethod === "store" && (
              <>
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Search for stores</h3>
                  <div className="relative">
                    <label htmlFor="storeSearch" className="block text-sm text-gray-500 mb-2">
                      Address or postcode
                    </label>
                    <input
                      type="text"
                      id="storeSearch"
                      value={storeSearchQuery}
                      onChange={(e) => setStoreSearchQuery(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-md"
                    />
                  </div>
                </div>

                <h3 className="font-medium mb-4">Store locations</h3>

                <StoreCard
                  name={selectedStore.name}
                  address1={selectedStore.address1}
                  address2={selectedStore.address2}
                  distance={selectedStore.distance}
                  openingHours={selectedStore.openingHours}
                  onEdit={() => {}}
                />

                <button
                  className="w-full py-3 border border-gray-200 rounded-md mb-6 text-center"
                  onClick={() => setShowStoreSelection(true)}
                >
                  Select a different store
                </button>

                <div className="py-2">
                  <SummaryItem label="Delivery cost" value="Free" />
                  <SummaryItem
                    label={
                      <div className="flex items-center">
                        Refund amount <span className="text-xs text-gray-500 ml-1">Incl. vat</span>
                      </div>
                    }
                    value={`€${refundAmount}`}
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
                    value={`€${refundAmount}`}
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
      </div>

      {showAddressForm && (
        <AddressForm initialAddress={address} onSave={handleSaveAddress} onCancel={() => setShowAddressForm(false)} />
      )}

      {showStoreSelection && (
        <StoreSelectionModal
          stores={storeLocations}
          onSelect={handleSelectStore}
          onClose={() => setShowStoreSelection(false)}
        />
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
