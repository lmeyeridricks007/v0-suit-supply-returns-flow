"use client"

import { useState, useEffect } from "react"
import { fetchReboundToken } from "@/app/actions/fetchReboundToken"
import { Loader2, AlertCircle, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { storeToken } from "@/lib/reboundTokenStore"

export function ReboundTokenDisplay() {
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rawRequest, setRawRequest] = useState<string>("")
  const [rawResponse, setRawResponse] = useState<string>("")
  const [showDetails, setShowDetails] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  const fetchToken = async () => {
    setLoading(true)
    const { token, expiresAt, error, rawRequest, rawResponse } = await fetchReboundToken()
    setToken(token)
    setExpiresAt(expiresAt)
    setError(error)
    setRawRequest(rawRequest)
    setRawResponse(rawResponse)
    setLoading(false)

    // Store the token for use in other API calls
    if (token && expiresAt) {
      await storeToken(token, expiresAt)
    }
  }

  useEffect(() => {
    fetchToken()
  }, [])

  // Update time remaining every second
  useEffect(() => {
    if (!expiresAt) return

    const updateTimeRemaining = () => {
      const now = Date.now()
      const remainingMs = expiresAt - now

      if (remainingMs <= 0) {
        setTimeRemaining("Expired")
        return
      }

      const minutes = Math.floor(remainingMs / 60000)
      const seconds = Math.floor((remainingMs % 60000) / 1000)
      setTimeRemaining(`${minutes}m ${seconds}s`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleRefresh = () => {
    fetchToken()
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-md p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-600">Generating Rebound API token...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <div className="flex items-center text-red-700 mb-2">
          <AlertCircle size={20} className="mr-2" />
          <h3 className="font-medium">Error generating Rebound API token</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-md text-red-700 hover:bg-red-50"
        >
          <RefreshCw size={16} />
          Try Again
        </button>

        <div className="mt-4 space-y-4">
          <div className="border border-gray-200 rounded-md p-4 bg-white">
            <h4 className="text-sm font-medium mb-2">Request:</h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs">{rawRequest}</pre>
          </div>

          <div className="border border-gray-200 rounded-md p-4 bg-white">
            <h4 className="text-sm font-medium mb-2">Response:</h4>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs max-h-96 overflow-y-auto">
              {rawResponse}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CheckCircle size={20} className="text-green-500 mr-2" />
            <h3 className="font-medium">Rebound API Token</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Expires in:</span>
              <span className="text-sm font-medium">{timeRemaining}</span>
            </div>
            <button onClick={handleRefresh} className="p-1 hover:bg-gray-200 rounded-full" aria-label="Refresh token">
              <RefreshCw size={16} className="text-gray-600" />
            </button>
            <button
              onClick={toggleDetails}
              className="p-1 hover:bg-gray-200 rounded-full"
              aria-label={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? (
                <ChevronUp size={16} className="text-gray-600" />
              ) : (
                <ChevronDown size={16} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Token:</h4>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 overflow-x-auto">
              <code className="text-xs break-all">{token}</code>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Request:</h4>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs">{rawRequest}</pre>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Response:</h4>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs max-h-96 overflow-y-auto">
                {rawResponse}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
