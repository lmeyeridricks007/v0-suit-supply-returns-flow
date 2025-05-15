"use client"

interface PickupTimeOption {
  id: string
  day: string
  timeRange: string
  carrier: string
  cost: string
}

interface PickupTimeSelectorProps {
  options: PickupTimeOption[]
  selectedOptionId: string
  onSelect: (optionId: string) => void
}

export function PickupTimeSelector({ options, selectedOptionId, onSelect }: PickupTimeSelectorProps) {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <button
          key={option.id}
          className={`w-full border ${
            selectedOptionId === option.id ? "border-gray-400" : "border-gray-200"
          } rounded-md p-4 text-left`}
          onClick={() => onSelect(option.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{option.day}</p>
              <p className="text-sm text-gray-600">{option.timeRange}</p>
              <p className="text-sm text-gray-600">By {option.carrier}</p>
            </div>
            <div className="text-sm">{option.cost}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
