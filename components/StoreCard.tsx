interface StoreCardProps {
  name: string
  address1: string
  address2: string
  distance: string
  openingHours?: string
  onEdit: () => void
}

export function StoreCard({ name, address1, address2, distance, openingHours, onEdit }: StoreCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-600">{address1}</p>
          <p className="text-sm text-gray-600">{address2}</p>
          {openingHours && <button className="text-sm text-gray-500 underline mt-1">{openingHours}</button>}
        </div>
        <div className="text-sm">{distance}</div>
      </div>
    </div>
  )
}
