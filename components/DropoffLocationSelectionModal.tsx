"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface DropoffLocation {
  id: string
  name: string
  address1: string
  address2: string
  distance: string
  openingHours?: string
}

interface DropoffLocationSelectionModalProps {
  locations: DropoffLocation[]
  onSelect: (locationId: string) => void
  onClose: () => void
}

export function DropoffLocationSelectionModal({ locations, onSelect, onClose }: DropoffLocationSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("1063 GX")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSelectLocation = (locationId: string) => {
    onSelect(locationId)
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Search for locations</h2>
        <button onClick={onClose} className="p-2">
          <X size={24} />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <label htmlFor="locationSearch" className="block text-sm text-gray-500 mb-2">
          Address or postcode
        </label>
        <input
          type="text"
          id="locationSearch"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-4 border border-gray-200 rounded-md"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="p-4 font-medium">Select location</h3>

        <div className="space-y-4 p-4">
          {locations.length > 0 ? (
            locations.map((location) => (
              <DropoffLocationCard
                key={location.id}
                name={location.name}
                address1={location.address1}
                address2={location.address2}
                distance={location.distance}
                openingHours={location.openingHours}
                onClick={() => handleSelectLocation(location.id)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No locations found in your area</div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => locations.length > 0 && onSelect(locations[0].id)}
          className={`w-full py-4 rounded-md ${
            locations.length > 0 ? "bg-gray-900 text-white" : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
          disabled={locations.length === 0}
        >
          Select
        </button>
      </div>
    </div>
  )
}

interface DropoffLocationCardProps {
  name: string
  address1: string
  address2: string
  distance: string
  openingHours?: string
  selected?: boolean
  onClick?: () => void
}

export function DropoffLocationCard({
  name,
  address1,
  address2,
  distance,
  openingHours,
  selected,
  onClick,
}: DropoffLocationCardProps) {
  return (
    <button
      className={`w-full text-left border ${selected ? "border-gray-400" : "border-gray-200"} rounded-md p-4 mb-4`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-600">{address1}</p>
          <p className="text-sm text-gray-600">{address2}</p>
          {openingHours && <button className="text-sm text-gray-500 underline mt-1">{openingHours}</button>}
        </div>
        <div className="text-sm">{distance}</div>
      </div>
    </button>
  )
}
