"use client"

interface AddressCardProps {
  name: string
  address1: string
  address2: string
  country: string
  onEdit: () => void
}

export function AddressCard({ name, address1, address2, country, onEdit }: AddressCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-600">{address1}</p>
          <p className="text-sm text-gray-600">{address2}</p>
          <p className="text-sm text-gray-600">{country}</p>
        </div>
        <button className="text-sm text-gray-700 underline" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  )
}
