const STORAGE_KEY = 'vinayak-erp-stability-data'

export function isStabilityModeEnabled() {
  if (typeof window === 'undefined') return false

  try {
    const params = new URLSearchParams(window.location.search)
    const queryValue = params.get('stability')

    if (queryValue === '0' || queryValue === 'false') {
      window.localStorage.removeItem(STORAGE_KEY)
      return false
    }

    if (queryValue === '1' || queryValue === 'true') {
      window.localStorage.setItem(STORAGE_KEY, 'true')
      return true
    }

    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function disableStabilityMode() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Keep the mode in-memory only when storage is unavailable.
  }
}

export { STORAGE_KEY as STABILITY_MODE_STORAGE_KEY }
