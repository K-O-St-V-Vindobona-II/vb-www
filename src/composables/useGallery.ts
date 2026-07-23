import { ref } from 'vue'
import { fetchGalleryImages, type GalleryImage } from '@/services/api'

// Deliberately does not call onMounted() itself - the consuming component
// (GallerySection.vue) owns the fetch-on-mount trigger, keeping this
// composable a plain, directly-testable state/actions bag (consistent with
// the rest of this codebase's composables, e.g. useScrollReveal.ts).
export function useGallery() {
  const images = ref<GalleryImage[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      images.value = await fetchGalleryImages()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Galerie konnte nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }

  return { images, loading, error, load }
}
