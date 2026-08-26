import { describe, it, expect, afterEach, vi } from 'vitest'
import { apiBaseUrl } from '@/runtimeConfig'

afterEach(() => {
  delete window.__APP_CONFIG__
  vi.unstubAllEnvs()
})

describe('runtimeConfig', () => {
  describe('apiBaseUrl', () => {
    it('prefers window.__APP_CONFIG__ when present', () => {
      window.__APP_CONFIG__ = { API_BASE_URL: 'https://runtime.example/api' }
      vi.stubEnv('VITE_API_BASE_URL', 'https://build-time.example/api')

      expect(apiBaseUrl()).toBe('https://runtime.example/api')
    })

    it('falls back to import.meta.env.VITE_API_BASE_URL when window.__APP_CONFIG__ is absent', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://build-time.example/api')

      expect(apiBaseUrl()).toBe('https://build-time.example/api')
    })

    it('falls back to the hardcoded literal default when neither source is set', () => {
      vi.stubEnv('VITE_API_BASE_URL', '')

      expect(apiBaseUrl()).toBe('https://api.vindobona2.at/api')
    })
  })
})
