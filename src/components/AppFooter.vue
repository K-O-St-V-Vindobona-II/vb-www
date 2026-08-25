<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSiteContent } from '@/composables/useSiteContent'

const year = new Date().getFullYear()

// Social links (which platforms, enabled/disabled, URL/label) are
// admin-editable (www-Administration -> Social Media Verweise) - the
// backend already filters to only the enabled ones, sorted.
const { content, load } = useSiteContent()
onMounted(load)

// Renders a real, confirmed Impressum dialog instead of a dead anchor link.
const impressumRef = ref<HTMLDialogElement | null>(null)

const openImpressum = () => {
  impressumRef.value?.showModal?.()
}

const closeImpressum = () => {
  impressumRef.value?.close?.()
}
</script>

<template>
  <footer class="app-footer">
    <p>&copy; Copyright {{ year }} K.Ö.St.V. Vindobona II Wien | Alle Rechte vorbehalten</p>
    <div class="footer-links">
      <a
        v-for="link in content?.social_links ?? []"
        :key="link.id"
        :href="link.url"
        target="_blank"
        rel="noopener"
        >{{ link.label }}</a
      >
      <button type="button" class="impressum-trigger" @click="openImpressum">Impressum</button>
    </div>

    <dialog ref="impressumRef" class="impressum-dialog">
      <button type="button" class="dialog-close" aria-label="Schließen" @click="closeImpressum">
        &times;
      </button>
      <h2>Impressum</h2>
      <dl>
        <dt>Medieninhaber, Herausgeber und Vereinssitz</dt>
        <dd>K.Ö.St.V. Vindobona II Wien, Rooseveltplatz 8/Sout., 1090 Wien</dd>

        <dt>ZVR-Zahl</dt>
        <dd>828508820</dd>

        <dt>Kontakt</dt>
        <dd>
          <a href="mailto:vindoboneninfo@gmail.com">vindoboneninfo@gmail.com</a>
        </dd>
      </dl>
    </dialog>
  </footer>
</template>

<style scoped>
.app-footer {
  text-align: center;
  padding: 2rem 1rem;
  background: var(--color-bg-alt);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.footer-links {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--color-text-muted);
}

.impressum-trigger {
  font: inherit;
  color: var(--color-text-muted);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

.impressum-trigger:hover,
.impressum-trigger:focus-visible {
  color: var(--color-primary);
}

.impressum-dialog {
  /* No position override here (unlike an earlier version of this rule) —
     the native `dialog:modal { position: fixed; inset: 0; margin: auto; }`
     UA rule is what centers the dialog in the viewport. Overriding it to
     `relative` broke that centering and made the browser jump the page to
     this dialog's in-flow position (the very bottom of the page, inside
     the footer) when it opened. GallerySection.vue's `.lightbox` dialog
     never had this override and never had the bug — same fix pattern. */
  max-width: min(90vw, 560px);
  max-height: 85vh;
  overflow-y: auto;
  border: none;
  border-radius: var(--radius-lg);
  padding: 2rem 1.75rem 1.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
  text-align: left;
}

.impressum-dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
}

.impressum-dialog dt {
  font-weight: 700;
  margin-top: 1rem;
}

.impressum-dialog dd {
  margin: 0.15rem 0 0;
}

.dialog-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: var(--color-bg-alt);
  color: var(--color-text);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}
</style>
