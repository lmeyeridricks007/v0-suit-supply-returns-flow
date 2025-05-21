// Country code to size type mapping
const europeanCountries = [
  "ES",
  "FR",
  "DE",
  "IT",
  "NL",
  "BE",
  "PT",
  "AT",
  "CH",
  "DK",
  "FI",
  "NO",
  "SE",
  "PL",
  "CZ",
  "HU",
  "RO",
  "BG",
  "GR",
  "IE",
]
const ukCountries = ["GB", "UK"]
const usCountries = ["US", "CA"]
const asianCountries = ["CN", "JP", "KR", "SG", "HK", "TW", "MY", "TH", "VN", "ID", "PH"]

/**
 * Get the appropriate size type based on country code
 * @param countryCode ISO country code
 * @returns Size type (EUR, UK, US, CN)
 */
export function getSizeTypeByCountry(countryCode: string): "EUR" | "UK" | "US" | "CN" {
  const upperCountryCode = countryCode.toUpperCase()

  if (europeanCountries.includes(upperCountryCode)) {
    return "EUR"
  }

  if (ukCountries.includes(upperCountryCode)) {
    return "UK"
  }

  if (usCountries.includes(upperCountryCode)) {
    return "US"
  }

  if (asianCountries.includes(upperCountryCode)) {
    return "CN"
  }

  // Default to EUR if no mapping found
  return "EUR"
}

/**
 * Get the size label based on country code
 * @param countryCode ISO country code
 * @returns Size label (EU, UK, US, CN)
 */
export function getSizeLabelByCountry(countryCode: string): string {
  const sizeType = getSizeTypeByCountry(countryCode)

  switch (sizeType) {
    case "EUR":
      return "EU"
    case "UK":
      return "UK"
    case "US":
      return "US"
    case "CN":
      return "CN"
    default:
      return "EU"
  }
}

/**
 * Get the appropriate size value based on country code and product details
 * @param countryCode ISO country code
 * @param productDetails Product details containing size information
 * @returns Size value with label
 */
export function getSizeByCountry(
  countryCode: string,
  productDetails: {
    sizeEUR?: string
    sizeUK?: string
    sizeUS?: string
    sizeCN?: string
  },
): string {
  const sizeType = getSizeTypeByCountry(countryCode)
  const sizeLabel = getSizeLabelByCountry(countryCode)

  let sizeValue: string | undefined

  switch (sizeType) {
    case "EUR":
      sizeValue = productDetails.sizeEUR
      break
    case "UK":
      sizeValue = productDetails.sizeUK
      break
    case "US":
      sizeValue = productDetails.sizeUS
      break
    case "CN":
      sizeValue = productDetails.sizeCN
      break
    default:
      sizeValue = productDetails.sizeEUR
  }

  // If the specific size is not available, fall back to EUR size
  if (!sizeValue && sizeType !== "EUR") {
    sizeValue = productDetails.sizeEUR
    return `${sizeValue || "N/A"} (EU)`
  }

  return `${sizeValue || "N/A"} (${sizeLabel})`
}
