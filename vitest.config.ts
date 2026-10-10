import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), {
    test: {
      environment: 'jsdom',
      // Vitest turns stylesheets into empty text unless they are listed here;
      // the scroll padding spec reads the raw text of the global stylesheet.
      css: { include: [/\/style\.css/] },
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: [
          'src/components/**',
          'src/composables/**',
          'src/services/**',
          'src/utils/**',
          'src/runtimeConfig.ts',
        ],
        thresholds: {
          statements: 70,
          branches: 65,
          functions: 70,
          lines: 70,
        },
      },
    },
  }),
)
