export const VALID_APP_ENVIRONMENTS = ['development', 'test', 'qa', 'production'] as const

export type ViteAppEnvironment = (typeof VALID_APP_ENVIRONMENTS)[number]

function isValidAppEnvironment(value: string): value is ViteAppEnvironment {
  return (VALID_APP_ENVIRONMENTS as readonly string[]).includes(value)
}

// Fails fast so misconfigured stages never build or start silently against
// the wrong backend, mirroring APP_ENVIRONMENT in vb-api/app/core/config.py
// and the analogous check in vb-intern/vite.env-check.ts.
//
// VITE_API_BASE_URL is only required outside "production": the production
// Docker image no longer bakes it in at build time — it reads the real API
// URL at container start from the unprefixed runtime variable API_BASE_URL
// instead (see docker/docker-entrypoint.d/40-generate-runtime-config.sh and
// src/runtimeConfig.ts). Every other stage still bakes VITE_API_BASE_URL in
// directly (no runtime injection there), so it stays mandatory to prevent a
// misconfigured local build from silently talking to the real production API.
export function validateViteEnv(env: Record<string, string | undefined>): void {
  const appEnvironment = env.VITE_APP_ENVIRONMENT

  if (!appEnvironment) {
    throw new Error(
      `FATAL: VITE_APP_ENVIRONMENT is not set. ` +
        `Required values: ${VALID_APP_ENVIRONMENTS.join(', ')}. Aborting.`,
    )
  }

  if (!isValidAppEnvironment(appEnvironment)) {
    throw new Error(
      `FATAL: VITE_APP_ENVIRONMENT='${appEnvironment}' is invalid. ` +
        `Valid values: ${VALID_APP_ENVIRONMENTS.join(', ')}. Aborting.`,
    )
  }

  if (appEnvironment !== 'production' && !env.VITE_API_BASE_URL) {
    throw new Error(
      'FATAL: VITE_API_BASE_URL must be set when VITE_APP_ENVIRONMENT ' +
        'is not "production". Aborting.',
    )
  }
}
