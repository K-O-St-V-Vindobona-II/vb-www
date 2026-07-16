// Fails fast so a misconfigured build never ships silently pointing at the
// wrong (or no) backend, mirroring APP_ENVIRONMENT in vb-api/app/core/config.py
// and the analogous check in vb-intern/vite.env-check.ts. Unlike vb-intern,
// api.vindobona2.at is always a different origin from www.vindobona2.at, so
// VITE_API_BASE_URL is required in every stage, not just non-production.
export function validateViteEnv(env: Record<string, string | undefined>): void {
  if (!env.VITE_API_BASE_URL) {
    throw new Error('FATAL: VITE_API_BASE_URL is not set. Aborting.')
  }
}
