import { Loader2 } from "lucide-react"

export function ReturnProcessingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <div className="mb-8">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-500 animate-progress rounded-full"></div>
          </div>
        </div>
        <h2 className="text-xl font-medium text-gray-700 mb-2">Your return is processing.</h2>
        <div className="mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto" />
        </div>
      </div>
    </div>
  )
}
