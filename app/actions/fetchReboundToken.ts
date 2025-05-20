"use server"

export interface ReboundTokenResponse {
  access_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: string
  "not-before-policy": number
  scope: string
}

export async function fetchReboundToken(): Promise<{
  token: string | null
  expiresAt: number | null
  error: string | null
  rawRequest: string
  rawResponse: string
}> {
  try {
    const url = "https://presso.cycleon.net/auth/realms/master/protocol/openid-connect/token"
    const basicAuth =
      "Basic Y29uc3VtZXItcG9ydGFsLWFwaS1TdWl0c3VwcGx5LXRlc3Q6d1RKUjhjaFlNaXdTcDVjNDFpOWJqQzZZTnhoUzN6QTk="

    const formData = new URLSearchParams()
    formData.append("grant_type", "client_credentials")
    formData.append("scope", "email subject profile")

    // Create the raw request string for display
    const rawRequest = `POST ${url}
Headers:
Content-Type: application/x-www-form-urlencoded
Authorization: ${basicAuth}
User-Agent: SuitSupply-Returns-Flow
Accept: */*
Cache-Control: no-cache
Connection: keep-alive

Body:
${formData.toString()}`

    // Make the actual API call
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth,
        "User-Agent": "SuitSupply-Returns-Flow",
        Accept: "*/*",
        "Cache-Control": "no-cache",
      },
      body: formData,
      cache: "no-store",
    })

    const responseText = await response.text()

    // Create the raw response string for display
    const rawResponse = `Status: ${response.status} ${response.statusText}
Headers:
${Array.from(response.headers.entries())
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

Body:
${responseText}`

    if (!response.ok) {
      return {
        token: null,
        expiresAt: null,
        error: `API Error: ${response.status} ${response.statusText}`,
        rawRequest,
        rawResponse,
      }
    }

    try {
      const data = JSON.parse(responseText) as ReboundTokenResponse

      // Calculate token expiration time (current time + expires_in seconds)
      const expiresAt = Date.now() + data.expires_in * 1000

      return {
        token: data.access_token,
        expiresAt,
        error: null,
        rawRequest,
        rawResponse,
      }
    } catch (parseError) {
      return {
        token: null,
        expiresAt: null,
        error: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        rawRequest,
        rawResponse,
      }
    }
  } catch (fetchError) {
    return {
      token: null,
      expiresAt: null,
      error: `Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      rawRequest: "Error generating request",
      rawResponse: "Error: Failed to fetch",
    }
  }
}
