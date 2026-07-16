<script setup lang="ts">
// Public Google Calendar (Simple Calendar plugin's _google_calendar_id, base64-decoded
// during the WordPress content audit) — same calendar as on the legacy site, now
// embedded via Google's own iframe instead of a custom-styled plugin.
const CALENDAR_ID = 'h7d2qp0jlg603cvq2aabdn2k5o@group.calendar.google.com'
const calendarSrc = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
  CALENDAR_ID,
)}&ctz=Europe%2FVienna`
</script>

<template>
  <section id="programm" class="programm-section">
    <h2>Programm</h2>

    <iframe
      :src="calendarSrc"
      title="Veranstaltungskalender"
      class="calendar-embed"
      loading="lazy"
    />

    <div class="hinweise">
      <h3>Hinweise</h3>
      <ul>
        <li>
          Alle Veranstaltungen beginnen, je nach Angabe, c.t. (cum tempore, 15 Minuten nach der
          angegebenen Zeit) oder s.t. (sine tempore, pünktlich).
        </li>
        <li>
          Alle Veranstaltungen finden auf der Bude Vindobonae statt, sofern nicht anders angegeben.
        </li>
        <li>
          Die Convente und alle als „intern“ bezeichneten Veranstaltungen finden ohne Gäste statt.
        </li>
        <li>
          Bei anderen Veranstaltungen sind Gäste willkommen — wenn du uns noch nicht kennst, bitten
          wir um kurze Voranmeldung.
        </li>
        <li>
          Die „offiziellen“ und „hochoffiziellen“ Veranstaltungen finden plen.col. („in vollen
          Farben“) statt. Auf ein entsprechendes Erscheinungsbild ist Wert zu legen.
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
  border-radius: 8px;
}

.hinweise {
  margin-top: 2rem;
}

.hinweise ul {
  padding-left: 1.2rem;
}

.hinweise li {
  margin-bottom: 0.5rem;
}

@media (min-width: 700px) {
  .calendar-embed {
    height: 550px;
  }
}
</style>
