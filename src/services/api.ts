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
  id: number
  text: string
}

export interface SiteContentQuote {
  id: number
  quote: string
  author: string
}

export interface SiteContentSocialLink {
  id: number
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function parseErrorDetail(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === 'string') return data.detail
  } catch {
    /* response wasn't JSON - fall through to the generic message */
  }
  return fallback
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  const response = await fetch(`${API_BASE_URL}/public/gallery`)
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, 'Galerie konnte nicht geladen werden.'))
  }
  return (await response.json()) as GalleryImage[]
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const response = await fetch(`${API_BASE_URL}/public/site-content`)
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, 'Inhalte konnten nicht geladen werden.'))
  }
  return (await response.json()) as SiteContent
}

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/public/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, 'Nachricht konnte nicht gesendet werden.'))
  }
}
