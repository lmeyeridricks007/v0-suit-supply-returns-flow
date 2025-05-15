"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface Store {
  id: string
  name: string
  address1: string
  address2: string
  distance: string
  openingHours?: string
}

interface StoreSelectionModalProps {
  stores: Store[]
  onSelect: (storeId: string) => void
  onClose: () => void
}

export function StoreSelectionModal({ stores, onSelect, onClose }: StoreSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("1063 GX")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSelectStore = (storeId: string) => {
    onSelect(storeId)
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Search for stores</h2>
        <button onClick={onClose} className="p-2">
          <X size={24} />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <label htmlFor="storeSearch" className="block text-sm text-gray-500 mb-2">
          Address or postcode
        </label>
        <input
          type="text"
          id="storeSearch"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-4 border border-gray-200 rounded-md"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="p-4 font-medium">Select store</h3>

        <div className="space-y-4 p-4">
          {stores.map((store) => (
            <button
              key={store.id}
              className="w-full border border-gray-200 rounded-md p-4 text-left"
              onClick={() => handleSelectStore(store.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-gray-600">{store.address1}</p>
                  <p className="text-sm text-gray-600">{store.address2}</p>
                  {store.openingHours && (
                    <button className="text-sm text-gray-500 underline mt-1">Opening hours</button>
                  )}
                </div>
                <div className="text-sm">{store.distance}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button onClick={() => onSelect(stores[0].id)} className="w-full py-4 bg-gray-900 text-white rounded-md">
          Select
        </button>
      </div>
    </div>
  )
}
