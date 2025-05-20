"use client"

import { useState, useEffect } from "react"
import { fetchDropOffLocations, type DropOffLocationsResponse } from "@/app/actions/fetchDropOffLocations"
import { Loader2, MapPin, AlertCircle, Info, ChevronDown, ChevronUp, Map, Calendar } from "lucide-react"
import { DropOffLocationsMap } from "./DropOffLocationsMap"

interface DropOffLocationsDetailsProps {
  postalCode?: string
  countryCode?: string
  searchRadius?: number
  referenceId?: string
  useSampleData?: boolean
}

export function DropOffLocationsDetails({
  postalCode = "28014",
  countryCode = "ES",
  searchRadius = 1,
  referenceId = "1019",
  useSampleData = false,
}: DropOffLocationsDetailsProps) {
  const [locationsData, setLocationsData] = useState<DropOffLocationsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawResponse, setRawResponse] = useState<string>("")
  const [rawRequest, setRawRequest] = useState<string>("")
  const [showDebugInfo, setShowDebugInfo] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [showAllLocations, setShowAllLocations] = useState(false)

  // Use a key to force re-render of the map component when needed
  const [mapKey, setMapKey] = useState(Date.now())

  useEffect(() => {
    async function getDropOffLocations() {
      setLoading(true)
      const { data, error, rawResponse, rawRequest } = await fetchDropOffLocations(
        {
          postalCode,
          countryCode,
          searchRadius,
          referenceId,
        },
        useSampleData,
      )
      setLocationsData(data)
      setError(error)
      setRawResponse(rawResponse)
      setRawRequest(rawRequest)
      setLoading(false)

      // Update map key when data changes to force re-render
      setMapKey(Date.now())
    }

    getDropOffLocations()
  }, [postalCode, countryCode, searchRadius, referenceId, useSampleData])

  // Calculate next day for collection
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

  // Parse weekday descriptions to a more readable format
  const parseWeekdayDescriptions = (weekdayDescriptions: string): Record<string, string> => {
    try {
      // Remove the brackets and split by commas
      const daysString = weekdayDescriptions.replace(/^\[|\]$/g, "")
      const days = daysString.split(", ")

      // Create an object with day as key and hours as value
      return days.reduce(
        (acc, day) => {
          const [dayName, hours] = day.split(": ")
          acc[dayName] = hours
          return acc
        },
        {} as Record<string, string>,
      )
    } catch (e) {
      return { Error: "Could not parse weekday descriptions" }
    }
  }

  // Format address to be more readable
  const formatAddress = (address: string): string => {
    const parts = address.split(" ")
    // Try to format as City PostalCode Region Country
    if (parts.length >= 4) {
      return `${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]}`
    }
    return address
  }

  // Calculate distance from customer location to drop-off point
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLng = deg2rad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  const toggleMap = () => {
    setShowMap(!showMap)
    // Force map re-render when toggling visibility
    if (!showMap) {
      setMapKey(Date.now())
    }
  }

  const toggleShowAllLocations = () => {
    setShowAllLocations(!showAllLocations)
  }

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
        <div className="flex items-center text-red-700 mb-2">
          <AlertCircle size={20} className="mr-2" />
          <h3 className="font-medium">Error loading drop-off locations</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>

        <div className="bg-white p-4 rounded-md border border-red-100 mb-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Info size={16} className="mr-2 text-gray-500" />
            Troubleshooting
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Check that the postal code is valid for the country</li>
            <li>Verify that the API token is valid and not expired</li>
            <li>Ensure the country code is supported (e.g., ES, GB)</li>
            <li>Try with a different postal code to see if the issue persists</li>
          </ul>
        </div>

        {debugInfo}
      </div>
    )
  }

  if (!locationsData || !locationsData.dropOffPointList || locationsData.dropOffPointList.length === 0) {
    return (
      <div className="border border-gray-200 rounded-md p-4">
        <p className="text-gray-500">No drop-off locations available for the provided postal code.</p>
        {debugInfo}
      </div>
    )
  }

  // Limit locations to 10 unless showAllLocations is true
  const displayedLocations = showAllLocations
    ? locationsData.dropOffPointList
    : locationsData.dropOffPointList.slice(0, 10)

  const totalLocations = locationsData.dropOffPointList.length
  const hiddenLocations = Math.max(0, totalLocations - 10)

  return (
    <div className="space-y-6">
      {/* Drop-off Locations Section */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Drop-off Locations near {postalCode}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Found {locationsData.dropOffPointList.length} locations within {searchRadius} km
              </p>
            </div>
            <button onClick={toggleMap} className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-md text-sm">
              <Map size={16} />
              {showMap ? "Hide Map" : "Show Map"}
            </button>
          </div>
        </div>

        {/* Map Section */}
        {showMap && locationsData.customerStreetGeoLocation && (
          <div className="p-4 border-b border-gray-200">
            <DropOffLocationsMap
              key={mapKey}
              customerLocation={locationsData.customerStreetGeoLocation}
              dropOffLocations={locationsData.dropOffPointList.map((location) => ({
                name: location.name,
                address: location.address,
                geoLocation: location.geoLocation,
                openNow: location.openNow,
                weekdayDescriptions: location.weekdayDescriptions,
              }))}
              height="350px"
              zoom={14}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Blue pin: Your location | Red pins: Drop-off points
            </p>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {displayedLocations.map((location, index) => {
            // Calculate distance if customer location is available
            let distance = null
            if (locationsData.customerStreetGeoLocation && location.geoLocation) {
              distance = calculateDistance(
                locationsData.customerStreetGeoLocation.lat,
                locationsData.customerStreetGeoLocation.lng,
                location.geoLocation.lat,
                location.geoLocation.lng,
              )
            }

            // Parse weekday descriptions
            const weekdays = parseWeekdayDescriptions(location.weekdayDescriptions)

            return (
              <div key={index} className="p-4">
                <div className="flex items-start">
                  <MapPin size={20} className="mr-3 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{formatAddress(location.address)}</p>

                    {distance !== null && <p className="text-sm text-gray-600 mt-1">Distance: {distance} km</p>}

                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">Opening Hours</h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                        {Object.entries(weekdays).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span>{day}</span>
                            <span className={hours === "Closed" ? "text-red-500" : ""}>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {location.openNow && (
                      <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Open Now
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Show more/less button if there are more than 10 locations */}
          {hiddenLocations > 0 && (
            <div className="p-4 text-center">
              <button onClick={toggleShowAllLocations} className="text-sm text-gray-700 underline">
                {showAllLocations ? "Show less" : `Show ${hiddenLocations} more locations`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collection Day Section */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-medium">Collection Day</h3>
        </div>

        <div className="p-4">
          <div className="flex items-start">
            <Calendar size={20} className="mr-3 text-gray-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">{getNextDayDate()}</h4>
              <p className="text-sm text-gray-600 mt-1">9:00 AM - 5:00 PM</p>
              <p className="text-sm text-gray-600 mt-1">By Correos</p>
              <div className="mt-3 px-3 py-2 bg-gray-50 rounded-md text-sm">
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc pl-5 text-xs text-gray-600 mt-1 space-y-1">
                  <li>Package must be ready for collection</li>
                  <li>Someone must be present to hand over the package</li>
                  <li>Ensure the return label is attached to the package</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Request & Response */}
      {debugInfo}
    </div>
  )
}
