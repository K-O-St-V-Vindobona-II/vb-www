import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGalleryImages, submitContactForm } from '@/services/api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('fetchGalleryImages', () => {
    it('fetches the public gallery endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: '1', url: 'https://x/1.jpg', caption: null, width: 1, height: 1 }],
      })

      const images = await fetchGalleryImages()

      expect(mockFetch).toHaveBeenCalledWith(`${import.meta.env.VITE_API_BASE_URL}/public/gallery`)
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
  })

  describe('submitContactForm', () => {
    it('posts the form payload as JSON', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await submitContactForm({ name: 'Max', email: 'max@example.com', message: 'Hallo!' })

      expect(mockFetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_BASE_URL}/public/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Max', email: 'max@example.com', message: 'Hallo!' }),
        },
      )
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
})
