<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useSiteContent } from '@/composables/useSiteContent'

const { content, loading, error, load } = useSiteContent()
onMounted(load)

const calendarSrc = computed(() => {
  const calendarId = content.value?.settings.programm_calendar_id
  if (!calendarId) return null
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
    calendarId,
  )}&ctz=Europe%2FVienna`
})

const icalHref = computed(() => {
  const calendarId = content.value?.settings.programm_calendar_id
  if (!calendarId) return null
  return `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`
})

// target is bound via the template's `ref="target"` only, which vue-tsc's
// project-references build mode doesn't trace for noUnusedLocals purposes.
const { target, visible } = useScrollReveal()
void target
</script>

<template>
  <section
    id="programm"
    ref="target"
    class="programm-section reveal"
    :class="{ 'is-visible': visible }"
  >
    <h2>Programm</h2>

    <p v-if="loading" class="status-message">Wird geladen&hellip;</p>
    <p v-else-if="error" class="status-message">{{ error }}</p>

    <template v-else-if="content">
      <iframe
        v-if="calendarSrc"
        :src="calendarSrc"
        title="Veranstaltungskalender"
        class="calendar-embed"
        loading="lazy"
      />

      <a v-if="icalHref" class="ical-link" :href="icalHref">
        <span aria-hidden="true">⤓</span> Kalender als .ical herunterladen
      </a>

      <div class="hinweise">
        <h3>Hinweise</h3>
        <ul class="hinweise-list">
          <li v-for="hint in content.programm_hints" :key="hint.id">
            <span class="hint-icon" aria-hidden="true">✓</span>
            <span>{{ hint.text }}</span>
          </li>
        </ul>
        <p>Wenn du Fragen zu unseren Veranstaltungen hast, schreib uns einfach!</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.programm-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.status-message {
  color: var(--color-text-muted);
}

.calendar-embed {
  width: 100%;
  height: 400px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.ical-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
}

.ical-link:hover,
.ical-link:focus-visible {
  background: var(--color-accent);
  color: #fff;
}

.hinweise {
  margin-top: 2rem;
}

.hinweise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hinweise-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.hint-icon {
  flex-shrink: 0;
  color: var(--color-accent);
  font-weight: 700;
}

@media (min-width: 700px) {
  .calendar-embed {
    height: 550px;
  }
}
</style>
