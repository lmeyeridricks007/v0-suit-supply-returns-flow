interface PickupTimeCardProps {
  day: string
  timeRange: string
  carrier: string
  cost: string
}

export function PickupTimeCard({ day, timeRange, carrier, cost }: PickupTimeCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{day}</p>
          <p className="text-sm text-gray-600">{timeRange}</p>
          <p className="text-sm text-gray-600">By {carrier}</p>
        </div>
        <div className="text-sm">{cost}</div>
      </div>
    </div>
  )
}
