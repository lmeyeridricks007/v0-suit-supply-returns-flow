"use server"

// Simple server-side token store
let tokenData: {
  token: string | null
  expiresAt: number | null
} = {
  token: null,
  expiresAt: null,
}

export async function storeToken(token: string, expiresAt: number): Promise<void> {
  tokenData = { token, expiresAt }
}

export async function getToken(): Promise<string | null> {
  // Check if token exists and is not expired
  if (tokenData.token && tokenData.expiresAt && Date.now() < tokenData.expiresAt) {
    return tokenData.token
  }
  return null
}

export async function isTokenValid(): Promise<boolean> {
  return !!(tokenData.token && tokenData.expiresAt && Date.now() < tokenData.expiresAt)
}

export async function clearToken(): Promise<void> {
  tokenData = { token: null, expiresAt: null }
}
