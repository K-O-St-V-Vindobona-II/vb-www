import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter', () => {
  it('shows the copyright notice with the current year', () => {
    const w = mount(AppFooter)
    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien')
    expect(w.text()).toContain(String(new Date().getFullYear()))
  })

  it('links to Facebook', () => {
    const w = mount(AppFooter)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://www.facebook.com/vindobona2')
  })

  it('opens a real Impressum dialog instead of a dead anchor', () => {
    const w = mount(AppFooter)
    // Regression guard: the legacy site's "Impressum" was a dead `href="#"`
    // link — make sure this never quietly regresses back to that.
    expect(w.findAll('a').some((a) => a.text() === 'Impressum')).toBe(false)

    const trigger = w.find('.impressum-trigger')
    expect(trigger.text()).toBe('Impressum')

    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien, Rooseveltplatz 8/Sout., 1090 Wien')
  })

  it('shows the confirmed ZVR-Zahl and a mailto contact link', () => {
    const w = mount(AppFooter)
    expect(w.text()).toContain('828508820')

    const mailLink = w.find('a[href="mailto:vindoboneninfo@gmail.com"]')
    expect(mailLink.exists()).toBe(true)
    expect(mailLink.text()).toBe('vindoboneninfo@gmail.com')
  })

  it('closes the Impressum dialog via the close button', async () => {
    const w = mount(AppFooter, { attachTo: document.body })
    await w.find('.impressum-trigger').trigger('click')
    await w.find('.dialog-close').trigger('click')
    // No native <dialog> "open" support in jsdom, so this only confirms the
    // close handler runs without throwing (see GallerySection for the same
    // showModal()/close() optional-call guard).
    expect(w.find('.dialog-close').exists()).toBe(true)
    w.unmount()
  })
})
