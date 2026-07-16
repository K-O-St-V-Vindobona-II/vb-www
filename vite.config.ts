import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { validateViteEnv } from './vite.env-check'

// Skipped under Vitest (process.env.VITEST): running unit tests is
// environment-agnostic and must not require deployment-stage config.
if (!process.env.VITEST) {
  try {
    validateViteEnv(process.env)
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['www.vindobona2.at.dev.schimpl.cc'],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
})
