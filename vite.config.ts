import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { validateBuildEnv } from './vite.env-check'

// The env check is skipped under Vitest (process.env.VITEST): running unit tests is
// environment-agnostic and must not require deployment-stage config.
function checkEnv(mode: string): void {
  if (process.env.VITEST) return
  try {
    validateBuildEnv(mode, process.cwd())
  } catch (err) {
    // The build must stop with the reason on the terminal, there is no logger at this point.
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

export default defineConfig(({ mode }) => {
  checkEnv(mode)

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      allowedHosts: ['www.vindobona2.at.dev.schimpl.cc'],
      // Coverage reports are rewritten on every test run; watching them would
      // trigger a full page reload per generated HTML file in the dev browser.
      watch: { ignored: ['**/coverage/**'] },
    },
    build: {
      sourcemap: false,
    },
  }
})
