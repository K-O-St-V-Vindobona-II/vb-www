<script setup lang="ts">
import { ref } from 'vue'
import { submitContactForm } from '@/services/api'

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
</script>

<template>
  <section id="kontakt" class="contact-section">
    <h2>Kontaktiere uns!</h2>

    <form class="contact-form" @submit.prevent="onSubmit">
      <label>
        Dein Name (Pflichtfeld)
        <input v-model="name" type="text" required maxlength="100" />
      </label>
      <label>
        Deine E-Mail-Adresse (Pflichtfeld)
        <input v-model="email" type="email" required />
      </label>
      <label>
        Deine Nachricht
        <textarea v-model="message" required maxlength="4000" rows="5" />
      </label>
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

    <iframe
      title="Standort"
      class="map-embed"
      loading="lazy"
      src="https://www.openstreetmap.org/export/embed.html?bbox=16.355957686901096%2C48.2148704647898%2C16.359498202800754%2C48.216428932128366&layer=mapnik&marker=48.215649704388795%2C16.35772794485092"
    />
  </section>
</template>

<style scoped>
.contact-section {
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.contact-form input,
.contact-form textarea {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-weight: 400;
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
  border-radius: 6px;
  background: var(--color-primary);
  color: var(--color-bg);
  cursor: pointer;
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

.map-embed {
  width: 100%;
  height: 300px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
</style>
