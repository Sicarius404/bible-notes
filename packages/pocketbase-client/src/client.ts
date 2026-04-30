import PocketBase from 'pocketbase'

let pbInstance: PocketBase | null = null

function getPublicPocketBaseUrl(): string | undefined {
  return process.env.EXPO_PUBLIC_POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL
}

/**
 * Get or create a PocketBase client instance.
 *
 * Expo:    Uses EXPO_PUBLIC_POCKETBASE_URL.
 * Browser: Uses NEXT_PUBLIC_POCKETBASE_URL, or falls back to window.location.origin.
 * SSR:     Uses POCKETBASE_URL env var (internal Docker hostname), or localhost.
 */
export function getPocketBase(url?: string): PocketBase {
  if (pbInstance && !url) return pbInstance

  let pbUrl: string
  if (url) {
    pbUrl = url
  } else if (getPublicPocketBaseUrl()) {
    pbUrl = getPublicPocketBaseUrl() as string
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    // Browser: fall back to the current origin when no explicit public URL is set
    pbUrl = window.location.origin
  } else {
    // SSR: use internal URL (Docker network or localhost)
    pbUrl = process.env.POCKETBASE_URL || 'http://localhost:8090'
  }

  pbInstance = new PocketBase(pbUrl)
  return pbInstance
}

/**
 * Reset the PocketBase instance (useful for logout or URL change).
 */
export function resetPocketBase(): void {
  pbInstance = null
}

/**
 * Escape a value for use in PocketBase filter strings.
 * Replaces single quotes and backslashes to prevent filter injection.
 */
export function escapeFilterValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

export { PocketBase }
