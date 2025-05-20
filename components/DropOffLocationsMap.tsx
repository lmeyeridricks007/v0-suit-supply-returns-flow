"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface Location {
  name: string
  address: string
  geoLocation: {
    lat: number
    lng: number
  }
  openNow?: boolean
  weekdayDescriptions?: string
}

interface DropOffLocationsMapProps {
  customerLocation: {
    lat: number
    lng: number
  }
  dropOffLocations: Location[]
  height?: string
  zoom?: number
  focusedLocationId?: string | null
  onLocationSelected?: (locationId: string) => void
}

export function DropOffLocationsMap({
  customerLocation,
  dropOffLocations,
  height = "400px",
  zoom = 16, // Default zoom level
  focusedLocationId,
  onLocationSelected,
}: DropOffLocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Generate a unique ID for the map container to avoid conflicts
  const mapId = useRef(`map-${Math.random().toString(36).substring(2, 9)}`)

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const loadMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default

        // Make sure the map container exists
        if (!mapRef.current) return

        // Clean up existing map instance if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          markersRef.current = []
        }

        // Add Leaflet CSS if it doesn't exist
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          link.crossOrigin = ""
          document.head.appendChild(link)
        }

        // Initialize map
        const map = L.map(mapRef.current).setView([customerLocation.lat, customerLocation.lng], zoom)
        mapInstanceRef.current = map

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Custom icons with z-index to ensure customer icon is on top
        const customerIcon = L.divIcon({
          html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold" style="z-index: 1000;">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-4 h-4">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>`,
          className: "customer-div-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16], // Center the icon
          popupAnchor: [0, -20], // Position popup directly above the icon
        })

        const locationIcon = L.divIcon({
          html: `<div class="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-3 h-3">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>`,
          className: "location-div-icon",
          iconSize: [24, 24],
          iconAnchor: [12, 12], // Center the icon
          popupAnchor: [0, -16], // Position popup directly above the icon
        })

        // Add drop-off location markers first (so they're below the customer marker)
        dropOffLocations.forEach((location, index) => {
          if (location.geoLocation && location.geoLocation.lat && location.geoLocation.lng) {
            const marker = L.marker([location.geoLocation.lat, location.geoLocation.lng], { icon: locationIcon }).addTo(
              map,
            )

            // Parse weekday descriptions if available
            let openingHoursHtml = ""
            if (location.weekdayDescriptions) {
              try {
                const daysString = location.weekdayDescriptions.replace(/^\[|\]$/g, "")
                const days = daysString.split(", ")
                openingHoursHtml = "<div class='text-xs mt-2'><strong>Opening Hours:</strong><br>"
                days.forEach((day) => {
                  const [dayName, hours] = day.split(": ")
                  openingHoursHtml += `${dayName}: ${hours}<br>`
                })
                openingHoursHtml += "</div>"
              } catch (e) {
                openingHoursHtml = ""
              }
            }

            // Create popup content
            const popupContent = `
              <div>
                <strong>${location.name}</strong>
                <div class="text-xs mt-1">${location.address}</div>
                ${location.openNow ? '<div class="text-xs text-green-600 mt-1">Open Now</div>' : ""}
                ${openingHoursHtml}
              </div>
            `

            marker.bindPopup(popupContent)

            // Add click handler to marker
            marker.on("click", () => {
              if (onLocationSelected) {
                onLocationSelected(index.toString())
              }
            })

            // Store the marker reference with its index
            markersRef.current.push({ marker, index: index.toString() })
          }
        })

        // Add customer marker last so it's on top
        const customerMarker = L.marker([customerLocation.lat, customerLocation.lng], {
          icon: customerIcon,
          zIndexOffset: 1000, // Ensure customer marker is on top
        }).addTo(map)

        // Add a popup to the customer marker
        customerMarker.bindPopup("<strong>Your Location</strong>")

        // Create bounds that include all markers
        const bounds = L.latLngBounds([customerLocation.lat, customerLocation.lng])
        dropOffLocations.forEach((location) => {
          if (location.geoLocation && location.geoLocation.lat && location.geoLocation.lng) {
            bounds.extend([location.geoLocation.lat, location.geoLocation.lng])
          }
        })

        // Count visible drop-off points
        const visibleDropOffPoints = dropOffLocations.filter(
          (location) => location.geoLocation && location.geoLocation.lat && location.geoLocation.lng,
        )

        // If there are drop-off locations, fit the map to show them
        if (visibleDropOffPoints.length > 0) {
          // Check if bounds are valid
          if (bounds.isValid()) {
            // Limit to showing approximately 10 locations by adjusting the zoom
            const adjustZoomToShowLimitedLocations = () => {
              let currentZoom = map.getZoom()
              let pointsInView = 0

              // Function to count points in current view
              const countPointsInView = () => {
                const mapBounds = map.getBounds()
                return visibleDropOffPoints.filter((loc) =>
                  mapBounds.contains([loc.geoLocation.lat, loc.geoLocation.lng]),
                ).length
              }

              // Start with a closer zoom and gradually zoom out until we see around 10 locations
              map.fitBounds(bounds.pad(0.1))

              // Initial count
              pointsInView = countPointsInView()

              // If we're showing too many points, increase zoom to show fewer
              while (pointsInView > 10 && currentZoom < 18) {
                currentZoom += 1
                map.setZoom(currentZoom)
                pointsInView = countPointsInView()
              }

              // If we're showing too few points, decrease zoom to show more
              while (pointsInView < 5 && currentZoom > 12) {
                currentZoom -= 1
                map.setZoom(currentZoom)
                pointsInView = countPointsInView()
              }
            }

            adjustZoomToShowLimitedLocations()
          } else {
            // If bounds are invalid, just zoom to customer location
            map.setView([customerLocation.lat, customerLocation.lng], zoom)
          }
        } else {
          // If no drop-off locations, just zoom to customer location
          map.setView([customerLocation.lat, customerLocation.lng], zoom)
        }

        // If a specific location is focused, zoom to it
        if (focusedLocationId !== undefined && focusedLocationId !== null) {
          const focusedMarker = markersRef.current.find((m) => m.index === focusedLocationId)
          if (focusedMarker) {
            const markerPosition = focusedMarker.marker.getLatLng()
            map.setView([markerPosition.lat, markerPosition.lng], 17) // Zoom in closer to the selected location
            focusedMarker.marker.openPopup()
          }
        }

        setMapLoaded(true)

        // Add a 'moveend' event to the map to track which locations are in view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.on("moveend", () => {
            // We could add logic here to filter locations based on the map's current bounds
            // and emit an event, but for now we'll show all locations in the list
            console.log("Map moved, bounds updated")
          })
        }
      } catch (error) {
        console.error("Error loading map:", error)
        setMapError(`Failed to load map: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    loadMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [customerLocation, dropOffLocations, zoom, focusedLocationId, onLocationSelected])

  if (mapError) {
    return (
      <div
        className="border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center text-red-500"
        style={{ height }}
      >
        {mapError}
      </div>
    )
  }

  return (
    <div className="relative border border-gray-200 rounded-md overflow-hidden" style={{ height }}>
      <div ref={mapRef} id={mapId.current} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  )
}
