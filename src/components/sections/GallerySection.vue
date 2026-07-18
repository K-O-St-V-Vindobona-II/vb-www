<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useGallery } from '@/composables/useGallery'
import type { GalleryImage } from '@/services/api'
import { useScrollReveal } from '@/composables/useScrollReveal'

const { images, loading, error, load } = useGallery()
onMounted(load)

const { target, visible } = useScrollReveal()

// Click-to-enlarge lightbox, built on the native <dialog> element — no new
// dependency needed. Captions stay alt-text-only here too (many migrated
// images only have camera filenames as captions, not real descriptions).
const selectedImage = ref<GalleryImage | null>(null)
const dialogRef = ref<HTMLDialogElement | null>(null)

const openImage = async (image: GalleryImage) => {
  selectedImage.value = image
  await nextTick()
  // Optional call: guards environments without native <dialog> support
  // (older browsers, jsdom in tests) instead of throwing.
  dialogRef.value?.showModal?.()
}

const closeImage = () => {
  dialogRef.value?.close?.()
  selectedImage.value = null
}

// Native <dialog> also closes on Escape/backdrop click, firing this same
// event — keep selectedImage in sync so the dialog unmounts cleanly.
const onDialogClose = () => {
  selectedImage.value = null
}
</script>

<template>
  <section
    id="eindruecke"
    ref="target"
    class="gallery-section reveal"
    :class="{ 'is-visible': visible }"
  >
    <h2>Eindrücke</h2>

    <p v-if="loading" class="status-message">Galerie wird geladen&hellip;</p>
    <p v-else-if="error" class="status-message">{{ error }}</p>
    <p v-else-if="images.length === 0" class="status-message">Noch keine Bilder vorhanden.</p>

    <div v-else class="gallery-grid">
      <figure v-for="image in images" :key="image.id" class="gallery-item">
        <button type="button" class="gallery-item-trigger" @click="openImage(image)">
          <img
            :src="image.url"
            :alt="image.caption ?? 'Impression von Vindobona II'"
            loading="lazy"
          />
        </button>
      </figure>
    </div>

    <dialog v-if="selectedImage" ref="dialogRef" class="lightbox" @close="onDialogClose">
      <button type="button" class="lightbox-close" aria-label="Schließen" @click="closeImage">
        &times;
      </button>
      <img :src="selectedImage.url" :alt="selectedImage.caption ?? 'Impression von Vindobona II'" />
    </dialog>
  </section>
</template>

<style scoped>
.gallery-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  text-align: center;
}

.status-message {
  color: var(--color-text-muted);
}

/* CSS-columns masonry: tiles keep their natural aspect ratio instead of a
   fixed crop, so the grid reads less uniform/boxy than a plain flex grid. */
.gallery-grid {
  columns: 220px;
  column-gap: 1rem;
  text-align: left;
}

.gallery-item {
  margin: 0 0 1rem;
  break-inside: avoid;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.gallery-item-trigger {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item-trigger:hover img,
.gallery-item-trigger:focus-visible img {
  transform: scale(1.04);
}

.lightbox {
  max-width: min(90vw, 1000px);
  max-height: 85vh;
  border: none;
  border-radius: var(--radius-md);
  padding: 0;
  background: transparent;
}

.lightbox::backdrop {
  background: rgba(0, 0, 0, 0.75);
}

.lightbox img {
  display: block;
  max-width: 100%;
  max-height: 85vh;
  border-radius: var(--radius-md);
}

.lightbox-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .gallery-item img {
    transition: none;
  }
}
</style>
