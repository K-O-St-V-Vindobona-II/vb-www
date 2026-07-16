<script setup lang="ts">
import { ref } from 'vue'

const tabs = [
  {
    title: 'Der Anfang',
    text: `Als Mittelschülerverbindung ist die katholische österreichische Studentenverbindung
      Vindobona II seit ihrer Gründung am 19.9.1928 eine Vereinigung, die sich vorwiegend an
      Schüler der Oberstufe und junge Studenten richtet. Mitglied werden kann jeder männliche
      Katholik, der eine Oberstufe besucht und die Matura anstrebt oder die Matura bereits
      absolviert hat. In farbstudentischer Tradition tragen die Mitglieder der Vindobona II ein
      rot-gold-rotes Burschenband mit grünem Vorstoß, das Fuchsenband ist gold-rot, die Deckel
      dunkelolivgrün. Als katholische Organisation lehnen wir jede Form des bewaffneten
      Zweikampfes ab — es ist den Mitgliedern der Vindobona II daher nicht gestattet, die Mensur
      zu fechten. Als österreichische Verbindung steht uns jeder Nationalismus und Extremismus
      fern. Anders als bei anderen Vereinen liegen bei Vindobona II die Vorstandsfunktionen sowie
      die meisten Organisationstätigkeiten in den Händen der Jungen, den sogenannten „Aktiven“.`,
  },
  {
    title: 'MKV – Unser Dachverband',
    text: `Vindobona II ist Teil des Mittelschülerkartellverbandes (MKV). Diesem gehören
      österreichweit über 160 Verbindungen mit insgesamt knapp 20.000 Mitgliedern an, was den
      MKV zur größten Schülerorganisation Österreichs macht. Der MKV ist wiederum Teil des
      Europäischen Kartellverbandes (EKV), der europaweit über 120.000 Mitglieder in rund 660
      Verbindungen in 15 Ländern umfasst. Was bei Vindobona II gepflegt wird, gründet auf vier
      unverrückbaren Prinzipien: religio (Bekenntnis zum katholischen Glauben), patria
      (Bekenntnis zur Heimat Österreich), scientia (lebenslanges Lernen), amicitia
      (Lebensfreundschaft).`,
  },
  {
    title: 'Heute',
    text: `Nach dem Eintritt bei Vindobona II absolviert jedes Neumitglied eine Probezeit
      (Fuchsenzeit), in der es die Verbindung und die Verbindung ihn kennenlernen kann.
      Entscheidet sich das Neumitglied, dabei zu bleiben, wird es nach ein bis zwei Jahren mit
      der feierlichen Burschung als Vollmitglied aufgenommen. In den folgenden Jahren übernimmt
      das Mitglied als „Aktiver“ Vorstandspositionen und Funktionen in der Verbindung. Nach
      einigen Jahren — häufig nach absolviertem Studium — wird das Mitglied „philistriert“,
      bleibt der Verbindung jedoch sein Leben lang angehörig und verbunden. Hier treffen Schüler
      auf Richter, Studenten auf Politiker und Praktikanten auf Vorstandsvorsitzende — alle
      pflegen untereinander das „Du“.`,
  },
]

const activeTab = ref(0)
</script>

<template>
  <section id="about" class="about-section">
    <h2>Über uns</h2>

    <div class="tab-buttons" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.title"
        type="button"
        role="tab"
        :aria-selected="activeTab === index"
        :class="{ active: activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </button>
    </div>

    <p class="tab-content" role="tabpanel">{{ tabs[activeTab]?.text }}</p>

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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.tab-buttons button {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
}

.tab-buttons button.active {
  background: var(--color-primary);
  color: var(--color-bg);
  border-color: var(--color-primary);
}

.tab-content {
  white-space: pre-line;
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
  border-radius: 8px;
}
</style>
