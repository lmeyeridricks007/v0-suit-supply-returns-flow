"use server"

import { getToken, isTokenValid } from "@/lib/reboundTokenStore"
import { fetchReboundToken } from "./fetchReboundToken"

export interface DropOffLocationsResponse {
  dropOffPointList: Array<{
    name: string
    openNow: boolean
    closingTime: string | null
    address: string
    geoLocation: {
      lat: number
      lng: number
    }
    weekdayDescriptions: string
    googleMapsUri: string | null
  }>
  customerStreetGeoLocation: {
    lat: number
    lng: number
  }
}

export async function fetchDropOffLocations(
  params?: {
    referenceId?: string
    searchRadius?: number
    postalCode?: string
    countryCode?: string
  },
  useSampleData = false,
): Promise<{
  data: DropOffLocationsResponse | null
  error: string | null
  rawResponse: string
  rawRequest: string
}> {
  try {
    // Default parameters
    const defaultParams = {
      referenceId: "1019",
      searchRadius: 1,
      postalCode: "28014",
      countryCode: "ES",
    }

    // Use provided params or defaults
    const paramsToUse = {
      ...defaultParams,
      ...params,
    }

    // Construct the URL with query parameters
    const url = `https://pre-consumer-api.cycleon.net/api/postal-services/drop-off-points?referenceId=${paramsToUse.referenceId}&searchRadius=${paramsToUse.searchRadius}&postalCode=${paramsToUse.postalCode}&countryCode=${paramsToUse.countryCode}`

    // Check if we have a valid token, if not, fetch a new one
    let token = await getToken()
    if (!token || !(await isTokenValid())) {
      const tokenResponse = await fetchReboundToken()
      if (tokenResponse.error || !tokenResponse.token) {
        return {
          data: null,
          error: `Failed to get valid token: ${tokenResponse.error || "Unknown error"}`,
          rawResponse: tokenResponse.rawResponse,
          rawRequest: tokenResponse.rawRequest,
        }
      }
      token = tokenResponse.token
    }

    // This is the raw request that would be made
    const rawRequest = `curl -X GET "${url}" -H "Authorization: Bearer ${token}" -H "accept: application/json"`

    console.log("Making Rebound Drop-off Locations API request:", url)

    // For debugging, let's use a sample response if requested
    if (useSampleData) {
      // Sample response as provided
      const sampleResponse = {
        dropOffPointList: [
          {
            name: "MADRID SUC 86. CORTE INGLES CALLAO",
            openNow: false,
            closingTime: null,
            address: "MADRID 28013 MADRID ES",
            geoLocation: {
              lat: 40.41943998,
              lng: -3.7056907,
            },
            weekdayDescriptions:
              "[Monday: 10:00-22:00, Tuesday: 10:00-22:00, Wednesday: 10:00-22:00, Thursday: 10:00-22:00, Friday: 10:00-22:00, Saturday: Closed, Sunday: Closed]",
            googleMapsUri: null,
          },
          {
            name: "MERCADO ANTON MARTIN",
            openNow: false,
            closingTime: null,
            address: "MADRID 28012 MADRID ES",
            geoLocation: {
              lat: 40.41140635,
              lng: -3.69880014,
            },
            weekdayDescriptions:
              "[Monday: Closed, Tuesday: Closed, Wednesday: Closed, Thursday: Closed, Friday: Closed, Saturday: Closed, Sunday: Closed]",
            googleMapsUri: null,
          },
          {
            name: "MADRID OP",
            openNow: false,
            closingTime: null,
            address: "MADRID 28014 MADRID ES",
            geoLocation: {
              lat: 40.41865991,
              lng: -3.69260979,
            },
            weekdayDescriptions:
              "[Monday: 08:00-21:00, Tuesday: 08:00-21:00, Wednesday: 08:00-21:00, Thursday: 08:00-21:00, Friday: 08:00-21:00, Saturday: 10:00-14:00, Sunday: Closed]",
            googleMapsUri: null,
          },
          {
            name: "CORREOS MADRID OP",
            openNow: false,
            closingTime: null,
            address: "MADRID 28014 MADRID ES",
            geoLocation: {
              lat: 40.41834506,
              lng: -3.69203299,
            },
            weekdayDescriptions:
              "[Monday: Closed, Tuesday: Closed, Wednesday: Closed, Thursday: Closed, Friday: Closed, Saturday: Closed, Sunday: Closed]",
            googleMapsUri: null,
          },
        ],
        customerStreetGeoLocation: {
          lat: 40.4166909,
          lng: -3.7003454,
        },
      }

      return {
        data: sampleResponse,
        error: null,
        rawResponse: JSON.stringify(sampleResponse),
        rawRequest,
      }
    }

    // Make the actual API call
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    })

    const rawResponse = await response.text()
    console.log("Rebound Drop-off Locations API response status:", response.status)

    // Log the first part of the response for debugging
    console.log("Rebound Drop-off Locations API response preview:", rawResponse.substring(0, 200))

    if (!response.ok) {
      return {
        data: null,
        error: `API Error: ${response.status} ${response.statusText}`,
        rawResponse,
        rawRequest,
      }
    }

    try {
      const data = JSON.parse(rawResponse)
      return {
        data,
        error: null,
        rawResponse,
        rawRequest,
      }
    } catch (parseError) {
      console.error("Failed to parse Rebound Drop-off Locations API response:", parseError)
      return {
        data: null,
        error: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        rawResponse,
        rawRequest,
      }
    }
  } catch (fetchError) {
    console.error("Failed to fetch from Rebound Drop-off Locations API:", fetchError)
    return {
      data: null,
      error: `Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      rawResponse: JSON.stringify({ error: "Failed to fetch" }),
      rawRequest: "Error generating request",
    }
  }
}
