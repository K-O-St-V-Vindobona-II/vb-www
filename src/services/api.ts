import { apiBaseUrl } from '@/runtimeConfig'

export interface GalleryImage {
  id: string
  url: string
  caption: string | null
  width: number
  height: number
}

export interface ContactFormPayload {
  name: string
  email: string
  message: string
  /** Honeypot field — must stay empty, see app/schemas/public_gallery.py. */
  website?: string
}

export interface AboutTabContent {
  title: string
  body: string
}

export interface SiteContentAboutTabs {
  anfang: AboutTabContent
  mkv: AboutTabContent
  heute: AboutTabContent
}

export interface SiteContentSettings {
  about_video_heading: string
  about_video_youtube_id: string
  programm_calendar_id: string
  gallery_heading: string
}

export interface SiteContentProgrammHint {
  id: string
  text: string
}

export interface SiteContentQuote {
  id: string
  quote: string
  author: string
}

export interface SiteContentSocialLink {
  id: string
  platform: string
  label: string
  url: string
}

export interface SiteContent {
  about_tabs: SiteContentAboutTabs
  settings: SiteContentSettings
  programm_hints: SiteContentProgrammHint[]
  quotes: SiteContentQuote[]
  social_links: SiteContentSocialLink[]
}

async function parseErrorDetail(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === 'string') return data.detail
  } catch {
    /* response wasn't JSON - fall through to the generic message */
  }
  return fallback
}

const REQUEST_TIMEOUT_MS = 15_000

// A network failure, a timeout and an unusable answer all surface as the same German message the
// caller passes in: the browser's own text for a failed fetch ("Failed to fetch") is English and
// means nothing to a visitor.
async function request(path: string, fallback: string, init: RequestInit = {}): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    throw new Error(fallback, { cause: error })
  }
  if (!response.ok) throw new Error(await parseErrorDetail(response, fallback))
  return response
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  const response = await request('/public/gallery', 'Galerie konnte nicht geladen werden.')
  return (await response.json()) as GalleryImage[]
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const response = await request('/public/site-content', 'Inhalte konnten nicht geladen werden.')
  return (await response.json()) as SiteContent
}

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  await request('/public/contact', 'Nachricht konnte nicht gesendet werden.', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
