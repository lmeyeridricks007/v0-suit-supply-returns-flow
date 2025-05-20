"use server"

import { getToken, isTokenValid } from "@/lib/reboundTokenStore"
import { fetchReboundToken } from "./fetchReboundToken"

export interface ReboundApiResponse {
  content: Array<{
    id: string
    postalCompanyId: number
    displayName: string
    description: string | null
    ecoScore: string | null
    logo: string | null
    type: string
    paperless: boolean
    available: boolean
    price: {
      amount: number
      currency: string | null
    }
    dropOffLocations: Array<{
      id: string
      name: string
      address: {
        streetAddress: string
        city: string
        postalCode: string
        countryCode: string
      }
      openingHours: string
      distance: number
      distanceUnit: string
    }>
    mandatoryFields: string[]
    collectionDates: Array<{
      date: string
      timeSlots: Array<{
        startTime: string
        endTime: string
      }>
    }>
  }>
  pageable: {
    sort: {
      unsorted: boolean
      sorted: boolean
      empty: boolean
    }
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
  size: number
  number: number
  sort: {
    unsorted: boolean
    sorted: boolean
    empty: boolean
  }
  empty: boolean
}

export async function fetchReboundData(
  address?: {
    streetAddress: string
    city: string
    postalCode: string
    countryCode: string
  },
  useSampleData = false,
  countryCode = "ES", // Default country code
): Promise<{
  data: ReboundApiResponse | null
  error: string | null
  rawResponse: string
  rawRequest: string
}> {
  try {
    // Use the provided countryCode parameter
    const url = `https://pre-consumer-api.cycleon.net/api/postal-services/search?clientRefString=Suitsupply&country=${countryCode}`

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

    // This is the raw request that would be made - showing the exact URL format
    const rawRequest = `curl -X GET "${url}" -H "Authorization: Bearer ${token}" -H "accept: application/json"`

    console.log("Making Rebound API request:", url)

    // For debugging, let's use a sample response if requested
    if (useSampleData) {
      // Sample response based on the API documentation, updated for the provided country code
      const sampleResponse = {
        content: [
          {
            id: "5831",
            postalCompanyId: 6,
            displayName: `${countryCode} Correos Paperless Pick Up`,
            description: null,
            ecoScore: null,
            logo: null,
            type: "PICK_UP",
            paperless: false,
            available: true,
            price: {
              amount: 5.99,
              currency: "EUR",
            },
            dropOffLocations: [],
            mandatoryFields: ["NAME", "POSTAL_CODE", "CITY", "EMAIL", "STREET_ADDRESS"],
            collectionDates: [
              {
                date: "2025-05-20",
                timeSlots: [
                  {
                    startTime: "09:00",
                    endTime: "13:00",
                  },
                  {
                    startTime: "13:00",
                    endTime: "17:00",
                  },
                ],
              },
            ],
          },
          {
            id: "5832",
            postalCompanyId: 7,
            displayName: `${countryCode} Correos Drop Off`,
            description: `Drop off your return at a Correos location in ${countryCode}`,
            ecoScore: "B",
            logo: null,
            type: "DROP_OFF",
            paperless: true,
            available: true,
            price: {
              amount: 0,
              currency: "EUR",
            },
            dropOffLocations: [
              {
                id: "do-1",
                name: "Correos Office - Madrid",
                address: {
                  streetAddress: "Calle Gran Vía 25",
                  city: "Madrid",
                  postalCode: "28013",
                  countryCode: countryCode,
                },
                openingHours: "Mon-Fri: 9:00-17:30, Sat: 10:00-14:00",
                distance: 0.8,
                distanceUnit: "km",
              },
            ],
            mandatoryFields: ["NAME", "POSTAL_CODE", "CITY", "EMAIL", "STREET_ADDRESS"],
            collectionDates: [],
          },
        ],
        pageable: {
          sort: {
            unsorted: true,
            sorted: false,
            empty: true,
          },
          pageNumber: 0,
          pageSize: 50,
          offset: 0,
          paged: true,
          unpaged: false,
        },
        totalElements: 2,
        totalPages: 1,
        last: true,
        first: true,
        numberOfElements: 2,
        size: 50,
        number: 0,
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
        empty: false,
      }

      return {
        data: sampleResponse,
        error: null,
        rawResponse: JSON.stringify(sampleResponse),
        rawRequest,
      }
    }

    // Make the actual API call with the updated URL
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    })

    const rawResponse = await response.text()
    console.log("Rebound API response status:", response.status)

    // Log the first part of the response for debugging
    console.log("Rebound API response preview:", rawResponse.substring(0, 200))

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
      console.error("Failed to parse Rebound API response:", parseError)
      return {
        data: null,
        error: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        rawResponse,
        rawRequest,
      }
    }
  } catch (fetchError) {
    console.error("Failed to fetch from Rebound API:", fetchError)
    return {
      data: null,
      error: `Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      rawResponse: JSON.stringify({ error: "Failed to fetch" }),
      rawRequest: "Error generating request",
    }
  }
}
