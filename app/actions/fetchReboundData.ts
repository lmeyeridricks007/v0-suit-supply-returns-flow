"use server"

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
): Promise<{
  data: ReboundApiResponse | null
  error: string | null
  rawResponse: string
  rawRequest: string
}> {
  try {
    // Using the simplified URL as specified
    const url = "https://pre-consumer-api.cycleon.net/api/postal-services/search?clientRefString=Suitsupply&country=GB"

    const token =
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJrVnFTSGpBZjlLUGgtZC1RUHhRWkV3VlJCbDR2aGtXYXVZME9aNG5NdThvIn0.eyJleHAiOjE3NDc2NjMwNTksImlhdCI6MTc0NzY2MTI1OSwianRpIjoiODRmZjk1YWQtOGFmZC00ZWJlLWI2MTQtODY3YTJlMDJhMWU3IiwiaXNzIjoiaHR0cHM6Ly9wcmVzc28uY3ljbGVvbi5uZXQvYXV0aC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiY29uc3VtZXItcG9ydGFsLWFwaSIsInN1YiI6IjM0MjgxNzIzLWI4YWQtNDRjMy04YjgxLTI4NTg0YWFhZDVjMCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImNvbnN1bWVyLXBvcnRhbC1hcGktU3VpdHN1cHBseS10ZXN0IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZXNvdXJjZV9hY2Nlc3MiOnsiY29uc3VtZXItcG9ydGFsLWFwaSI6eyJyb2xlcyI6WyJjbGllbnQtcG9ydGFsIl19fSwic2NvcGUiOiJlbWFpbCBzdWJqZWN0IHByb2ZpbGUiLCJjbGllbnRIb3N0IjoiMTAuMTA0LjE2Mi4xNjUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInVzZXJfbmFtZSI6InNlcnZpY2UtYWNjb3VudC1jb25zdW1lci1wb3J0YWwtYXBpLXN1aXRzdXBwbHktdGVzdCIsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1jb25zdW1lci1wb3J0YWwtYXBpLXN1aXRzdXBwbHktdGVzdCIsImNsaWVudEFkZHJlc3MiOiIxMC4xMDQuMTYyLjE2NSIsImNsaWVudF9pZCI6ImNvbnN1bWVyLXBvcnRhbC1hcGktU3VpdHN1cHBseS10ZXN0In0.NLPf914zrn-zanADrx7-O8G1YW0DEPS36V7jZLOlWJrrs-LWhZuq4AnS0_jlr7g8kF5uE2kdn_bx45MYFeuuhl55joLcUJKXB2WYTbePLGxJCVkiw955aLpatBWwdGpzYEWcAPK6Sj0XHTb-QnUyC9lzKiT3OLsRo7JQ9RV5qZK1_pLBa5ZBBST2qheKxOLO4mlmOGlUE149o7v3hwxJY1tZSPOXQ6mF-uOHOvff6X6VFxfHv5ljB9dkpdPWIarQA8H1czp8c0nOdc4fHZ2Vh9N9Pju_OEDxkSehQQnmBoOsEvQMvy9bS3TT_uDGNg3d1KwgGwIdqrJTUYMT2OIRCA"

    // This is the raw request that would be made - showing the exact URL format
    const rawRequest = `curl -X GET "${url}" -H "Authorization: Bearer ${token}" -H "accept: application/json"`

    console.log("Making Rebound API request:", url)

    // For debugging, let's use a sample response if requested
    if (useSampleData) {
      // Sample response based on the API documentation
      const sampleResponse = {
        content: [
          {
            id: "5831",
            postalCompanyId: 6,
            displayName: "GB Royal Mail Paperless Pick Up RK",
            description: null,
            ecoScore: null,
            logo: null,
            type: "PICK_UP",
            paperless: false,
            available: true,
            price: {
              amount: 0,
              currency: "GBP",
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
            displayName: "GB Royal Mail Drop Off",
            description: "Drop off your return at a Royal Mail location",
            ecoScore: "B",
            logo: null,
            type: "DROP_OFF",
            paperless: true,
            available: true,
            price: {
              amount: 0,
              currency: "GBP",
            },
            dropOffLocations: [
              {
                id: "do-1",
                name: "Royal Mail Post Office - Central London",
                address: {
                  streetAddress: "25 High Street",
                  city: "London",
                  postalCode: "W1D 1AB",
                  countryCode: "GB",
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

    // Make the actual API call with the simplified URL
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
