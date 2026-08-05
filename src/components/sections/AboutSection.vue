<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useSiteContent } from '@/composables/useSiteContent'
import LinkedParagraphs from '@/components/LinkedParagraphs.vue'

const { content, loading, error, load } = useSiteContent()
onMounted(load)

const TAB_SLOTS = ['anfang', 'mkv', 'heute'] as const
type TabSlot = (typeof TAB_SLOTS)[number]

const activeTab = ref(0)
const activeSlot = computed<TabSlot>(() => TAB_SLOTS[activeTab.value] ?? 'anfang')
const activeTabContent = computed(() => content.value?.about_tabs[activeSlot.value] ?? null)

const videoSrc = computed(() => {
  const youtubeId = content.value?.settings.about_video_youtube_id
  return youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?wmode=transparent&autoplay=0`
    : null
})

// target is bound via the template's `ref="target"` only, which vue-tsc's
// project-references build mode doesn't trace for noUnusedLocals purposes.
const { target, visible } = useScrollReveal()
void target
</script>

<template>
  <section id="about" ref="target" class="about-section reveal" :class="{ 'is-visible': visible }">
    <h2>Über uns</h2>

    <p v-if="loading" class="status-message">Wird geladen&hellip;</p>
    <p v-else-if="error" class="status-message">{{ error }}</p>

    <template v-else-if="content">
      <div class="tab-buttons" role="tablist">
        <button
          v-for="(slot, index) in TAB_SLOTS"
          :key="slot"
          type="button"
          role="tab"
          :aria-selected="activeTab === index"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ content.about_tabs[slot].title }}
        </button>
        <span class="tab-indicator" :style="{ transform: `translateX(${activeTab * 100}%)` }" />
      </div>

      <div class="tab-content" role="tabpanel">
        <LinkedParagraphs v-if="activeTabContent" :text="activeTabContent.body" />
      </div>

      <div class="mkv-video">
        <p class="mkv-video-label">{{ content.settings.about_video_heading }}</p>
        <iframe
          v-if="videoSrc"
          :src="videoSrc"
          title="#MKVbringts – Mittelschüler-Kartell-Verband (MKV)"
          loading="lazy"
          allowfullscreen
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.about-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.status-message {
  color: var(--color-text-muted);
}

/* CSS Grid, not flex-wrap: three equal-width columns always, even on very
   narrow screens where a longer label needs two lines — the tab-indicator's
   width/position math below assumes exactly three same-width slots in a
   single row, which flex-wrap would silently break by letting a button
   wrap onto its own row. */
.tab-buttons {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  padding: 0.3rem;
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
}

.tab-buttons button {
  position: relative;
  z-index: 1;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.6rem 0.5rem;
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: color 0.25s ease;
}

.tab-buttons button.active {
  color: #fff;
}

.tab-indicator {
  position: absolute;
  z-index: 0;
  top: 0.3rem;
  bottom: 0.3rem;
  left: 0.3rem;
  width: calc(100% / 3 - 0.3rem);
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease;
}

.tab-content {
  line-height: 1.7;
}

.mkv-video {
  margin-top: 2rem;
}

.mkv-video-label {
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.mkv-video iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  border-radius: var(--radius-md);
}

@media (prefers-reduced-motion: reduce) {
  .tab-indicator,
  .tab-buttons button {
    transition: none;
  }
}
</style>
