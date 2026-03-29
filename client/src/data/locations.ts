export interface SupportedLocation {
  city: string
  country: string
  lat: number
  lng: number
}

export const supportedLocations: SupportedLocation[] = [
  { city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633 },
  { city: 'Boston', country: 'United States', lat: 42.3601, lng: -71.0589 },
  { city: 'Dallas', country: 'United States', lat: 32.7767, lng: -96.797 },
  { city: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.531 },
  { city: 'Kathmandu', country: 'Nepal', lat: 27.7172, lng: 85.324 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { city: 'London', country: 'United Kingdom', lat: 51.5072, lng: -0.1276 },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
  { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.006 },
  { city: 'Pokhara', country: 'Nepal', lat: 28.2096, lng: 83.9856 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
]

function normalize(input: string) {
  return input.trim().toLowerCase()
}

export function findSupportedLocation(city: string) {
  const normalizedCity = normalize(city)

  return supportedLocations.find((location) => normalize(location.city) === normalizedCity) ?? null
}
