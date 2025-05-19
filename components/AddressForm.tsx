"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Search, ChevronDown } from "lucide-react"

interface AddressFormProps {
  initialAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  onSave: (address: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }) => void
  onCancel: () => void
}

export function AddressForm({ initialAddress, onSave, onCancel }: AddressFormProps) {
  const [address, setAddress] = useState(initialAddress)
  const [originalAddress] = useState(initialAddress)
  const [addressQuery, setAddressQuery] = useState(address.address)
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(true)
  const [formChanged, setFormChanged] = useState(false)

  // Check if form has changed whenever address is updated
  useEffect(() => {
    const hasChanged =
      address.firstName !== originalAddress.firstName ||
      address.lastName !== originalAddress.lastName ||
      address.email !== originalAddress.email ||
      address.phone !== originalAddress.phone ||
      address.address !== originalAddress.address ||
      address.city !== originalAddress.city ||
      address.postalCode !== originalAddress.postalCode ||
      address.country !== originalAddress.country

    setFormChanged(hasChanged)
  }, [address, originalAddress])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressQuery(e.target.value)
    setShowAddressSuggestions(true)
    setAddress((prev) => ({ ...prev, address: e.target.value }))
  }

  const handleAddressSelect = (selectedAddress: string) => {
    setAddressQuery(selectedAddress)
    setShowAddressSuggestions(false)

    // Parse the address to extract city and postal code
    const parts = selectedAddress.split(" ")
    const postalCode = parts.length > 4 ? `${parts[parts.length - 3]} ${parts[parts.length - 2]}` : ""
    const city = parts.length > 4 ? parts[parts.length - 1] : ""

    setAddress((prev) => ({
      ...prev,
      address: selectedAddress,
      postalCode,
      city,
    }))
  }

  const handleSubmit = () => {
    onSave(address)
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Edit Address</h2>
        <button onClick={onCancel} className="p-2">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <h2 className="text-lg font-medium mb-6 mt-6">Contact</h2>

        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm text-gray-500 mb-2">
            First name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={address.firstName}
            onChange={handleChange}
            className="w-full p-4 border border-gray-200 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm text-gray-500 mb-2">
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={address.lastName}
            onChange={handleChange}
            className="w-full p-4 border border-gray-200 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-gray-500 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={address.email}
            onChange={handleChange}
            className="w-full p-4 border border-gray-200 rounded-md"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm text-gray-500 mb-2">
            Phone
          </label>
          <div className="flex">
            <div className="w-1/4">
              <button className="w-full h-full flex items-center justify-between px-4 border border-gray-200 rounded-l-md">
                <div className="flex items-center">
                  <span className="mr-2">🇳🇱</span>
                  <span>+31</span>
                </div>
                <ChevronDown size={20} />
              </button>
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              className="w-3/4 p-4 border border-gray-200 rounded-r-md"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="addressSearch" className="block text-sm text-gray-500 mb-2">
            Start typing address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="addressSearch"
              value={addressQuery}
              onChange={handleAddressChange}
              className="w-full p-4 pl-10 border border-gray-200 rounded-md"
            />

            {showAddressSuggestions && (
              <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
                  Keep typing your address to display results
                </div>
                <button
                  className="w-full text-left p-4 hover:bg-gray-50"
                  onClick={() => handleAddressSelect("Lou jansenplein 18, 3 1063 GX Amsterdam")}
                >
                  Lou jansenplein 18, 3 1063 GX Amsterdam
                </button>
                <button className="w-full text-left p-4 text-gray-700 hover:bg-gray-50">Enter address manually</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSubmit}
          className={`w-full py-4 rounded-md ${
            formChanged ? "bg-gray-900 text-white" : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
          disabled={!formChanged}
        >
          Save address
        </button>
      </div>
    </div>
  )
}
