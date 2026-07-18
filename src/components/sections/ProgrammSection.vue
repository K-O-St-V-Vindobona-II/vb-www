<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'

// Public Google Calendar (Simple Calendar plugin's _google_calendar_id, base64-decoded
// during the WordPress content audit) — same calendar as on the legacy site, now
// embedded via Google's own iframe instead of a custom-styled plugin.
const CALENDAR_ID = 'h7d2qp0jlg603cvq2aabdn2k5o@group.calendar.google.com'
const calendarSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
  CALENDAR_ID,
)}&ctz=Europe%2FVienna`
const icalHref = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`

const hints = [
  'Alle Veranstaltungen beginnen, je nach Angabe, c.t. (cum tempore, 15 Minuten nach der angegebenen Zeit) oder s.t. (sine tempore, pünktlich).',
  'Alle Veranstaltungen finden auf der Bude Vindobonae statt, sofern nicht anders angegeben.',
  'Die Convente und alle als „intern“ bezeichneten Veranstaltungen finden ohne Gäste statt.',
  'Bei anderen Veranstaltungen sind Gäste willkommen — wenn du uns noch nicht kennst, bitten wir um kurze Voranmeldung.',
  'Die „offiziellen“ und „hochoffiziellen“ Veranstaltungen finden plen.col. („in vollen Farben“) statt. Auf ein entsprechendes Erscheinungsbild ist Wert zu legen.',
]

const { target, visible } = useScrollReveal()
</script>

<template>
  <section
    id="programm"
    ref="target"
    class="programm-section reveal"
    :class="{ 'is-visible': visible }"
  >
    <h2>Programm</h2>

    <iframe
      :src="calendarSrc"
      title="Veranstaltungskalender"
      class="calendar-embed"
      loading="lazy"
    />

    <a class="ical-link" :href="icalHref">
      <span aria-hidden="true">⤓</span> Kalender als .ical herunterladen
    </a>

    <div class="hinweise">
      <h3>Hinweise</h3>
      <ul class="hinweise-list">
        <li v-for="hint in hints" :key="hint">
          <span class="hint-icon" aria-hidden="true">✓</span>
          <span>{{ hint }}</span>
        </li>
      </ul>
      <p>Wenn du Fragen zu unseren Veranstaltungen hast, schreib uns einfach!</p>
    </div>
  </section>
</template>

<style scoped>
.programm-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
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
