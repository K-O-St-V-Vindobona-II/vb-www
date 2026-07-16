<script setup lang="ts">
import { onMounted } from 'vue'
import { useGallery } from '@/composables/useGallery'

const { images, loading, error, load } = useGallery()
onMounted(load)
</script>

<template>
  <section id="eindruecke" class="gallery-section">
    <h2>Eindrücke</h2>

    <p v-if="loading" class="status-message">Galerie wird geladen&hellip;</p>
    <p v-else-if="error" class="status-message">{{ error }}</p>
    <p v-else-if="images.length === 0" class="status-message">Noch keine Bilder vorhanden.</p>

    <div v-else class="gallery-grid">
      <figure v-for="image in images" :key="image.id" class="gallery-item">
        <img
          :src="image.url"
          :alt="image.caption ?? 'Impression von Vindobona II'"
          loading="lazy"
        />
      </figure>
    </div>
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  text-align: left;
}

.gallery-item {
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
</style>
