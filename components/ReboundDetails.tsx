"use client"

import { useState, useEffect } from "react"
import { fetchReboundData, type ReboundApiResponse } from "@/app/actions/fetchReboundData"
import { Loader2, MapPin, Truck, Calendar, ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react"

interface ReboundDetailsProps {
  address?: {
    streetAddress: string
    city: string
    postalCode: string
    countryCode: string
  }
  useSampleData?: boolean
}

export function ReboundDetails({ address, useSampleData = false }: ReboundDetailsProps) {
  const [reboundData, setReboundData] = useState<ReboundApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawResponse, setRawResponse] = useState<string>("")
  const [rawRequest, setRawRequest] = useState<string>("")
  const [expandedSection, setExpandedSection] = useState<string | null>("returnOptions")
  const [showDebugInfo, setShowDebugInfo] = useState(true)

  useEffect(() => {
    async function getReboundData() {
      setLoading(true)
      const { data, error, rawResponse, rawRequest } = await fetchReboundData(address, useSampleData)
      setReboundData(data)
      setError(error)
      setRawResponse(rawResponse)
      setRawRequest(rawRequest)
      setLoading(false)
    }

    getReboundData()
  }, [address, useSampleData])

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
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

  // Always show the debug info when there's an error
  const debugInfo = (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">API Request & Response</h3>
        {!error && (
          <button onClick={() => setShowDebugInfo(!showDebugInfo)} className="text-sm text-gray-500 flex items-center">
            {showDebugInfo ? "Hide" : "Show"} Details
            {showDebugInfo ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
        )}
      </div>

      {(showDebugInfo || error) && (
        <>
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Request:</h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs">{rawRequest}</pre>
          </div>

          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Response:</h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs max-h-96 overflow-y-auto">
              {rawResponse
                ? rawResponse.startsWith("{")
                  ? JSON.stringify(JSON.parse(rawResponse), null, 2)
                  : rawResponse
                : "No response data"}
            </pre>
          </div>
        </>
      )}
    </div>
  )

  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <div className="flex items-center text-red-700 mb-2">
          <AlertCircle size={20} className="mr-2" />
          <h3 className="font-medium">Error loading Rebound data</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>

        <div className="bg-white p-4 rounded-md border border-red-100 mb-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Info size={16} className="mr-2 text-gray-500" />
            Troubleshooting
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Check that the address format is correct</li>
            <li>Verify that the API token is valid and not expired</li>
            <li>Ensure the country code is supported (e.g., GB, NL)</li>
            <li>Try with a different address to see if the issue persists</li>
          </ul>
        </div>

        {debugInfo}
      </div>
    )
  }

  if (!reboundData) {
    return (
      <div className="border border-gray-200 rounded-md p-4">
        <p className="text-gray-500">No Rebound data available</p>
        {debugInfo}
      </div>
    )
  }

  // Check if there's any content
  if (!reboundData.content || reboundData.content.length === 0) {
    return (
      <div className="border border-gray-200 rounded-md p-4">
        <div className="flex items-center text-amber-600 mb-2">
          <AlertCircle size={20} className="mr-2" />
          <h3 className="font-medium">No return options available</h3>
        </div>
        <p className="text-gray-600">No return options were found for the provided address.</p>
        {debugInfo}
      </div>
    )
  }

  // Group return options by type
  const returnOptions = reboundData.content.reduce(
    (acc, option) => {
      const type = option.type === "PICK_UP" ? "Pickup" : option.type === "DROP_OFF" ? "Dropoff" : option.type

      if (!acc[type]) {
        acc[type] = []
      }

      acc[type].push(option)
      return acc
    },
    {} as Record<string, typeof reboundData.content>,
  )

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-medium">Rebound Return Options</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Return Options */}
          <div className="p-4">
            <button
              onClick={() => toggleSection("returnOptions")}
              className="flex items-center justify-between w-full text-left font-medium mb-2"
            >
              <div className="flex items-center">
                <span className="mr-2">Return Options</span>
              </div>
              {expandedSection === "returnOptions" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSection === "returnOptions" && (
              <div className="mt-4 space-y-4">
                {Object.entries(returnOptions).length > 0 ? (
                  Object.entries(returnOptions).map(([type, options]) => (
                    <div key={type} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center mb-2">
                        {type === "Pickup" ? (
                          <Truck size={20} className="mr-2 text-gray-600" />
                        ) : (
                          <MapPin size={20} className="mr-2 text-gray-600" />
                        )}
                        <h4 className="font-medium">{type}</h4>
                      </div>
                      <div className="space-y-3">
                        {options.map((option) => (
                          <div key={option.id} className="pl-7">
                            <p className="font-medium">{option.displayName}</p>
                            {option.description && <p className="text-sm text-gray-600">{option.description}</p>}
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-600 mr-4">
                                Price:{" "}
                                {option.price.amount === 0
                                  ? "Free"
                                  : `${option.price.amount} ${option.price.currency || ""}`}
                              </span>
                              {option.ecoScore && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                  Eco Score: {option.ecoScore}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No return options available</p>
                )}
              </div>
            )}
          </div>

          {/* Drop Off Locations */}
          <div className="p-4">
            <button
              onClick={() => toggleSection("dropOffLocations")}
              className="flex items-center justify-between w-full text-left font-medium mb-2"
            >
              <div className="flex items-center">
                <span className="mr-2">Drop Off Locations</span>
              </div>
              {expandedSection === "dropOffLocations" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSection === "dropOffLocations" && (
              <div className="mt-4 space-y-4">
                {reboundData.content
                  .filter((option) => option.dropOffLocations && option.dropOffLocations.length > 0)
                  .map((option) => (
                    <div key={option.id} className="border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium mb-3">{option.displayName}</h4>
                      <div className="space-y-4">
                        {option.dropOffLocations.map((location) => (
                          <div key={location.id} className="border-t border-gray-100 pt-3">
                            <p className="font-medium">{location.name}</p>
                            <p className="text-sm text-gray-600">
                              {location.address.streetAddress}, {location.address.city}, {location.address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{location.openingHours}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Distance: {location.distance} {location.distanceUnit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {!reboundData.content.some(
                  (option) => option.dropOffLocations && option.dropOffLocations.length > 0,
                ) && <p className="text-gray-500">No drop-off locations available</p>}
              </div>
            )}
          </div>

          {/* Collection Days */}
          <div className="p-4">
            <button
              onClick={() => toggleSection("collectionDays")}
              className="flex items-center justify-between w-full text-left font-medium mb-2"
            >
              <div className="flex items-center">
                <span className="mr-2">Collection Days</span>
              </div>
              {expandedSection === "collectionDays" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSection === "collectionDays" && (
              <div className="mt-4 space-y-4">
                {reboundData.content
                  .filter((option) => option.collectionDates && option.collectionDates.length > 0)
                  .map((option) => (
                    <div key={option.id} className="border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium mb-3">{option.displayName}</h4>
                      <div className="space-y-4">
                        {option.collectionDates.map((collection, idx) => (
                          <div key={idx} className="border-t border-gray-100 pt-3">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2 text-gray-600" />
                              <p className="font-medium">{formatDate(collection.date)}</p>
                            </div>
                            <div className="mt-2 pl-6">
                              <p className="text-sm text-gray-600 mb-1">Available time slots:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {collection.timeSlots && collection.timeSlots.length > 0 ? (
                                  collection.timeSlots.map((slot, slotIdx) => (
                                    <div key={slotIdx} className="border border-gray-200 rounded p-2 text-center">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-gray-500">No time slots available</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {!reboundData.content.some((option) => option.collectionDates && option.collectionDates.length > 0) && (
                  <p className="text-gray-500">No collection days available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Request & Response */}
      {debugInfo}
    </div>
  )
}
