<script setup lang="ts">
import { ref } from 'vue'
import { submitContactForm } from '@/services/api'
import { useScrollReveal } from '@/composables/useScrollReveal'

const name = ref('')
const email = ref('')
const message = ref('')
// Honeypot: stays empty for real users (hidden via CSS below), bots that
// blindly fill every field trip the backend's validation.
const website = ref('')

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const onSubmit = async () => {
  submitting.value = true
  success.value = false
  error.value = null
  try {
    await submitContactForm({
      name: name.value,
      email: email.value,
      message: message.value,
      website: website.value,
    })
    success.value = true
    name.value = ''
    email.value = ''
    message.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Nachricht konnte nicht gesendet werden.'
  } finally {
    submitting.value = false
  }
}

const { target, visible } = useScrollReveal()
</script>

<template>
  <section
    id="kontakt"
    ref="target"
    class="contact-section reveal"
    :class="{ 'is-visible': visible }"
  >
    <h2>Kontaktiere uns!</h2>
    <p class="intro">Du möchtest mehr über uns erfahren? Dann schau doch mal vorbei!</p>

    <div class="contact-grid">
      <form class="contact-form" @submit.prevent="onSubmit">
        <div class="field">
          <input
            id="contact-name"
            v-model="name"
            type="text"
            required
            maxlength="100"
            placeholder=" "
          />
          <label for="contact-name">Dein Name (Pflichtfeld)</label>
        </div>
        <div class="field">
          <input id="contact-email" v-model="email" type="email" required placeholder=" " />
          <label for="contact-email">Deine E-Mail-Adresse (Pflichtfeld)</label>
        </div>
        <div class="field">
          <textarea
            id="contact-message"
            v-model="message"
            required
            maxlength="4000"
            rows="5"
            placeholder=" "
          />
          <label for="contact-message">Deine Nachricht</label>
        </div>
        <input
          v-model="website"
          type="text"
          name="website"
          class="honeypot"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        />

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Wird gesendet…' : 'Senden' }}
        </button>

        <p v-if="success" class="form-message success">
          Vielen Dank für deine Mitteilung. Sie wurde versandt.
        </p>
        <p v-if="error" class="form-message error">{{ error }}</p>
      </form>

      <div class="contact-info">
        <address class="contact-address">
          <strong>K.Ö.St.V. Vindobona II Wien</strong><br />
          Rooseveltplatz 8/Sout.<br />
          1090 Wien<br />
          <span class="bell-hint">Bitte bei „Vindobona“ anläuten!</span>
        </address>
        <iframe
          title="Standort"
          class="map-embed"
          loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=16.355957686901096%2C48.2148704647898%2C16.359498202800754%2C48.216428932128366&layer=mapnik&marker=48.215649704388795%2C16.35772794485092"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.intro {
  color: var(--color-text-muted);
  margin-top: -0.25rem;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1.5rem;
}

.contact-form,
.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* Floating label: `placeholder=" "` (a non-empty space) keeps
   `:placeholder-shown` behavior consistent across browsers; the label sits
   over the input until it gains a value or focus. */
.field {
  position: relative;
}

.field input,
.field textarea {
  width: 100%;
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 1.1rem 0.75rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
}

.field input:focus,
.field textarea:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.field label {
  position: absolute;
  left: 0.8rem;
  top: 0.85rem;
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-text-muted);
  pointer-events: none;
  transition:
    top 0.15s ease,
    font-size 0.15s ease,
    color 0.15s ease;
}

.field input:focus + label,
.field input:not(:placeholder-shown) + label,
.field textarea:focus + label,
.field textarea:not(:placeholder-shown) + label {
  top: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-primary);
}

.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.contact-form button {
  align-self: flex-start;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1rem;
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  color: #fff;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.contact-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-message.success {
  color: var(--color-accent);
  font-weight: 600;
}

.form-message.error {
  color: var(--color-primary-dark);
  font-weight: 600;
}

.contact-address {
  font-style: normal;
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
}

.bell-hint {
  display: inline-block;
  margin-top: 0.35rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.map-embed {
  width: 100%;
  height: 300px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

@media (prefers-reduced-motion: reduce) {
  .field label {
    transition: none;
  }
}

@media (min-width: 700px) {
  .contact-grid {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
