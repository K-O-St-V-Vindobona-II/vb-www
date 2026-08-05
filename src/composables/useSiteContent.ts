import { reactive, toRefs } from 'vue'
import { fetchSiteContent, type SiteContent } from '@/services/api'

interface SiteContentState {
  content: SiteContent | null
  loading: boolean
  error: string | null
}

const state = reactive<SiteContentState>({
  content: null,
  loading: true,
  error: null,
})

// Module-scoped promise, not per-call state (unlike useGallery.ts, which
// hands each caller a fresh ref bag - fine there since it has exactly one
// consumer). Five independent sections (AppNav, AppFooter, AboutSection,
// ProgrammSection, TestimonialsSection) each call load() from their own
// onMounted(); without this memoization every one of them would fire its
// own /public/site-content request.
let loadPromise: Promise<void> | null = null

async function doLoad(): Promise<void> {
  state.loading = true
  state.error = null
  try {
    state.content = await fetchSiteContent()
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Inhalte konnten nicht geladen werden.'
  } finally {
    state.loading = false
  }
}

export function useSiteContent() {
  const load = () => {
    loadPromise ??= doLoad()
    return loadPromise
  }

  return { ...toRefs(state), load }
}
