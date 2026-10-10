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

    it('throws instead of guessing the production API when neither source is set', () => {
      vi.stubEnv('VITE_API_BASE_URL', '')

      expect(() => apiBaseUrl()).toThrow('API base URL is not configured')
    })

    it('treats an empty runtime value like a missing one', () => {
      window.__APP_CONFIG__ = { API_BASE_URL: '' }
      vi.stubEnv('VITE_API_BASE_URL', 'https://build-time.example/api')

      expect(apiBaseUrl()).toBe('https://build-time.example/api')
    })

    it.each([
      ['https://runtime.example/api/', 'https://runtime.example/api'],
      ['https://runtime.example/api///', 'https://runtime.example/api'],
      ['https://runtime.example/api', 'https://runtime.example/api'],
    ])('drops trailing slashes: %s', (configured, expected) => {
      window.__APP_CONFIG__ = { API_BASE_URL: configured }

      expect(apiBaseUrl()).toBe(expected)
    })
  })
})
