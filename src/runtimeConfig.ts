// Central runtime-configuration reader.
//
// PRODUCTION: the Docker entrypoint hook script
// (docker/docker-entrypoint.d/40-generate-runtime-config.sh) renders
// public/config.template.js into /usr/share/nginx/html/config.js from the
// real container env var every time the container starts. index.html loads
// it via a plain (non-module) <script> tag before the app's module bundle,
// so window.__APP_CONFIG__ is always populated before this module is ever
// evaluated. This is what lets the same built image be redeployed across
// environments purely via a container env-var change, without a rebuild.
//
// DEV / VITEST: nothing generates config.js, so the <script src="/config.js">
// tag in index.html 404s harmlessly and window.__APP_CONFIG__ stays
// undefined. The getter below then falls through to the existing
// import.meta.env.VITE_API_BASE_URL build-time variable, then to the same
// literal default that existed in the code before this module was
// introduced.

declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>
  }
}

function readRuntimeConfig(key: string): string | undefined {
  return window.__APP_CONFIG__?.[key]
}

export function apiBaseUrl(): string {
  return (
    readRuntimeConfig('API_BASE_URL') ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://api.vindobona2.at/api'
  )
}
