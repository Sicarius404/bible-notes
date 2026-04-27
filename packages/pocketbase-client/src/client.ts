import PocketBase from 'pocketbase'

let pbInstance: PocketBase | null = null

/**
 * Get or create a PocketBase client instance.
 *
 * Browser: Uses NEXT_PUBLIC_POCKETBASE_URL env var, or falls back to
 *          window.location.origin + '/api' (proxied through Nginx in production).
 * SSR:     Uses POCKETBASE_URL env var (internal Docker hostname), or localhost.
 */
export function getPocketBase(url?: string): PocketBase {
  if (pbInstance && !url) return pbInstance

  let pbUrl: string
  if (url) {
    pbUrl = url
  } else if (typeof window !== 'undefined') {
    // Browser: use public URL (proxied through Nginx) or same-origin /api path
    pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || `${window.location.origin}/api`
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