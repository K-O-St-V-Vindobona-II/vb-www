<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

// Only tab titles live in data now — the tab bodies below contain real
// markup (a hyperlink in tab 0, a list in tab 1), which a plain
// `{{ tabs[activeTab].text }}` interpolation can't render without `v-html`
// (forbidden by this repo's ESLint config for XSS-hardening reasons).
const tabs = ['Der Anfang', 'MKV – Unser Dachverband', 'Heute']

const activeTab = ref(0)
const { target, visible } = useScrollReveal()

const friendshipConnections = [
  'K.Ö.St.V. Ostaricia Wien',
  'K.Ö.St.V. Kreuzenstein Wien',
  'K.Ö.St.V. Rugia Waidhofen/Thaya',
  'GV Zähringia Freiburg',
  'K.Ö.St.V. Donaumark',
  'K.Ö.St.V. Vindobona nova',
]
</script>

<template>
  <section id="about" ref="target" class="about-section reveal" :class="{ 'is-visible': visible }">
    <h2>Über uns</h2>

    <div class="tab-buttons" role="tablist">
      <button
        v-for="(title, index) in tabs"
        :key="title"
        type="button"
        role="tab"
        :aria-selected="activeTab === index"
        :class="{ active: activeTab === index }"
        @click="activeTab = index"
      >
        {{ title }}
      </button>
      <span class="tab-indicator" :style="{ transform: `translateX(${activeTab * 100}%)` }" />
    </div>

    <div class="tab-content" role="tabpanel">
      <template v-if="activeTab === 0">
        <p>
          Als Mittelschülerverbindung ist die katholische österreichische Studentenverbindung
          Vindobona II seit ihrer Gründung am 19.9.1928 eine Vereinigung, die sich vorwiegend an
          Schüler der Oberstufe und junge Studenten richtet. Mitglied werden kann jeder männliche
          Katholik, der eine Oberstufe besucht und die Matura anstrebt oder die Matura bereits
          absolviert hat. In farbstudentischer Tradition tragen die Mitglieder der Vindobona II ein
          rot-gold-rotes Burschenband mit grünem Vorstoß, das Fuchsenband ist gold-rot, die Deckel
          dunkelolivgrün. Als katholische Organisation lehnen wir jede Form des bewaffneten
          Zweikampfes ab — es ist den Mitgliedern der Vindobona II daher nicht gestattet, die Mensur
          zu fechten. Als österreichische Verbindung steht uns jeder Nationalismus und Extremismus
          fern. Anders als bei anderen Vereinen liegen bei Vindobona II die Vorstandsfunktionen
          sowie die meisten Organisationstätigkeiten in den Händen der Jungen, den sogenannten
          „Aktiven“.
        </p>
        <p>
          Viele Mitglieder aus der Gründungszeit unserer Verbindung waren im Widerstand aktiv. Das
          Projekt „Niemals Wieder“ hat es sich zur Aufgabe gemacht, katholische Farbstudenten im
          Widerstand zu dokumentieren und zusammenzutragen. Die Stolpersteine der Widerstandskämpfer
          unserer Verbindung sind
          <a
            href="https://niemalswieder.at/Stolpersteine/Steine/1368"
            target="_blank"
            rel="noopener"
            >hier zu finden</a
          >.
        </p>
      </template>

      <template v-else-if="activeTab === 1">
        <p>
          Vindobona II ist Teil des Mittelschülerkartellverbandes (MKV). Diesem gehören
          österreichweit über 160 Verbindungen mit insgesamt knapp 20.000 Mitgliedern an, was den
          MKV zur größten Schülerorganisation Österreichs macht. Der MKV ist wiederum Teil des
          Europäischen Kartellverbandes (EKV), der europaweit über 120.000 Mitglieder in rund 660
          Verbindungen in 15 Ländern umfasst. Was bei Vindobona II gepflegt wird, gründet auf vier
          unverrückbaren Prinzipien: religio (Bekenntnis zum katholischen Glauben), patria
          (Bekenntnis zur Heimat Österreich), scientia (lebenslanges Lernen), amicitia
          (Lebensfreundschaft).
        </p>
        <div class="friendships">
          <p class="friendships-heading">Unsere Freundschaftsverbindungen:</p>
          <ul class="friendship-chips">
            <li v-for="name in friendshipConnections" :key="name">{{ name }}</li>
          </ul>
        </div>
      </template>

      <template v-else>
        <p>
          Nach dem Eintritt bei Vindobona II absolviert jedes Neumitglied eine Probezeit
          (Fuchsenzeit), in der es die Verbindung und die Verbindung ihn kennenlernen kann.
          Entscheidet sich das Neumitglied, dabei zu bleiben, wird es nach ein bis zwei Jahren mit
          der feierlichen Burschung als Vollmitglied aufgenommen. In den folgenden Jahren übernimmt
          das Mitglied als „Aktiver“ Vorstandspositionen und Funktionen in der Verbindung. Nach
          einigen Jahren — häufig nach absolviertem Studium — wird das Mitglied „philistriert“,
          bleibt der Verbindung jedoch sein Leben lang angehörig und verbunden. Hier treffen Schüler
          auf Richter, Studenten auf Politiker und Praktikanten auf Vorstandsvorsitzende — alle
          pflegen untereinander das „Du“.
        </p>
      </template>
    </div>

    <div class="mkv-video">
      <p class="mkv-video-label">Erfahre mehr über den MKV</p>
      <iframe
        src="https://www.youtube.com/embed/Sh51ebB2G8A?wmode=transparent&autoplay=0"
        title="#MKVbringts – Mittelschüler-Kartell-Verband (MKV)"
        loading="lazy"
        allowfullscreen
      />
    </div>
  </section>
</template>

<style scoped>
.about-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.tab-buttons {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  padding: 0.3rem;
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
}

.tab-buttons button {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.6rem 0.75rem;
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

.tab-content p {
  margin: 0 0 1rem;
}

.tab-content a {
  font-weight: 700;
}

.friendships {
  margin-top: 1.5rem;
}

.friendships-heading {
  font-weight: 700;
  margin: 0 0 0.6rem;
}

.friendship-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.friendship-chips li {
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
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
