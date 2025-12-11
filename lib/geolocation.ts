// Geolocation utilities for Findkar

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface GeolocationError {
  code: number
  message: string
}

/**
 * Get user's current location
 * @returns Promise with coordinates or error
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "Geolocation is not supported by your browser",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        let message = "Unable to retrieve your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }
        reject({ code: error.code, message })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Watch user's location continuously
 * @param callback Function to call when location updates
 * @returns Watch ID to clear later
 */
export const watchLocation = (
  callback: (coords: Coordinates) => void
): number => {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser")
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },
    (error) => {
      console.error("Error watching location:", error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
    }
  )
}

/**
 * Clear location watch
 * @param watchId Watch ID from watchLocation
 */
export const clearLocationWatch = (watchId: number): void => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export const formatDistance = (distance: number): string => {
  if (distance < 0.05) { // Less than 50m considers as "at location" due to GPS drift
    return "0 m"
  }
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  return `${distance.toFixed(1)} km`
}

/**
 * Get directions URL for Google Maps
 * @param lat Destination latitude
 * @param lng Destination longitude
 * @param name Optional destination name (not used, kept for compatibility)
 * @returns Google Maps URL
 */
export const getDirectionsUrl = (lat: number, lng: number, name?: string): string => {
  // Always use coordinates only for accurate mapping
  // Added travelmode=walking to help start navigation faster
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
}

/**
 * Request location permission
 * @returns Promise with permission status
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!navigator.permissions) {
    // Fallback: Try to get location directly
    try {
      await getCurrentLocation()
      return true
    } catch {
      return false
    }
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" })
    return result.state === "granted"
  } catch {
    return false
  }
}

/**
 * Check if coordinates are valid
 */
export const isValidCoordinates = (coords: Coordinates | null): boolean => {
  if (!coords) return false
  const { latitude, longitude } = coords
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * Save location to localStorage
 */
export const saveLocation = (coords: Coordinates): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("lastLocation", JSON.stringify(coords))
  }
}

/**
 * Get saved location from localStorage
 */
export const getSavedLocation = (): Coordinates | null => {
  if (typeof window === "undefined") return null

  try {
    const saved = localStorage.getItem("lastLocation")
    if (!saved) return null

    const coords = JSON.parse(saved) as Coordinates
    return isValidCoordinates(coords) ? coords : null
  } catch {
    return null
  }
}

/**
 * Clear saved location
 */
export const clearSavedLocation = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lastLocation")
  }
}
