import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchGalleryImages, fetchSiteContent, submitContactForm } from '@/services/api'

const TEST_API_BASE_URL = 'https://api.test.example/api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    // Stubbed explicitly instead of relying on whatever VITE_API_BASE_URL
    // happens to be set in the running environment (e.g. a dev container's
    // .env vs. a CI runner with none at all) - see runtimeConfig.ts, which
    // would otherwise resolve to a different value or throw depending on
    // where the test runs.
    vi.stubEnv('VITE_API_BASE_URL', TEST_API_BASE_URL)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('fetchGalleryImages', () => {
    it('fetches the public gallery endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: '1', url: 'https://x/1.jpg', caption: null, width: 1, height: 1 }],
      })

      const images = await fetchGalleryImages()

      expect(mockFetch).toHaveBeenCalledWith(`${TEST_API_BASE_URL}/public/gallery`, {
        signal: expect.any(AbortSignal),
      })
      expect(images).toHaveLength(1)
    })

    it('throws the backend detail message on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Serverfehler' }),
      })

      await expect(fetchGalleryImages()).rejects.toThrow('Serverfehler')
    })

    it('falls back to a generic message when the error body is not JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('not json')
        },
      })

      await expect(fetchGalleryImages()).rejects.toThrow('Galerie konnte nicht geladen werden.')
    })

    it('falls back to a generic message when the JSON body has no string detail', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: [{ msg: 'field required' }] }),
      })

      await expect(fetchGalleryImages()).rejects.toThrow('Galerie konnte nicht geladen werden.')
    })
  })

  describe('submitContactForm', () => {
    it('posts the form payload as JSON', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await submitContactForm({ name: 'Max', email: 'max@example.com', message: 'Hallo!' })

      expect(mockFetch).toHaveBeenCalledWith(`${TEST_API_BASE_URL}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Max', email: 'max@example.com', message: 'Hallo!' }),
        signal: expect.any(AbortSignal),
      })
    })

    it('throws the backend detail message on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Invalid submission.' }),
      })

      await expect(
        submitContactForm({ name: 'Bot', email: 'bot@example.com', message: 'spam', website: 'x' }),
      ).rejects.toThrow('Invalid submission.')
    })
  })

  describe('fetchSiteContent', () => {
    it('fetches the site content endpoint', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ quotes: [] }) })

      const content = await fetchSiteContent()

      expect(mockFetch).toHaveBeenCalledWith(`${TEST_API_BASE_URL}/public/site-content`, {
        signal: expect.any(AbortSignal),
      })
      expect(content).toEqual({ quotes: [] })
    })

    it('throws the backend detail message on failure', async () => {
      mockFetch.mockResolvedValue({ ok: false, json: async () => ({ detail: 'Wartung' }) })

      await expect(fetchSiteContent()).rejects.toThrow('Wartung')
    })

    it('falls back to a German message when the body has no detail', async () => {
      mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) })

      await expect(fetchSiteContent()).rejects.toThrow('Inhalte konnten nicht geladen werden.')
    })
  })

  describe('a request that never reaches the API', () => {
    it.each([
      ['fetchGalleryImages', () => fetchGalleryImages(), 'Galerie konnte nicht geladen werden.'],
      ['fetchSiteContent', () => fetchSiteContent(), 'Inhalte konnten nicht geladen werden.'],
      [
        'submitContactForm',
        () => submitContactForm({ name: 'Max', email: 'max@example.com', message: 'Hallo' }),
        'Nachricht konnte nicht gesendet werden.',
      ],
    ])(
      '%s reports a network failure in German, not as the browser words it',
      async (_n, call, text) => {
        mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

        await expect(call()).rejects.toThrow(text)
      },
    )

    it('keeps the original failure as the cause of the German message', async () => {
      const failure = new TypeError('Failed to fetch')
      mockFetch.mockRejectedValue(failure)

      await expect(fetchGalleryImages()).rejects.toMatchObject({ cause: failure })
    })

    it('gives up after 15 seconds instead of waiting for ever', async () => {
      const timeout = new AbortController()
      const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal)
      mockFetch.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
          }),
      )

      const pending = fetchGalleryImages()
      timeout.abort(new DOMException('timed out', 'TimeoutError'))

      await expect(pending).rejects.toThrow('Galerie konnte nicht geladen werden.')
      expect(timeoutSpy).toHaveBeenCalledWith(15_000)
      timeoutSpy.mockRestore()
    })

    it('reports a missing API address in German and keeps the cause', async () => {
      vi.stubEnv('VITE_API_BASE_URL', '')

      await expect(fetchGalleryImages()).rejects.toMatchObject({
        message: 'Galerie konnte nicht geladen werden.',
        cause: expect.objectContaining({ message: expect.stringContaining('API base URL') }),
      })
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})
