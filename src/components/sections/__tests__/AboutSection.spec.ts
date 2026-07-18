import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutSection from '../AboutSection.vue'

describe('AboutSection', () => {
  it('shows the first tab by default', () => {
    const w = mount(AboutSection)
    expect(w.text()).toContain('Als Mittelschülerverbindung')
  })

  it('switches tab content when a tab button is clicked', async () => {
    const w = mount(AboutSection)
    const buttons = w.findAll('button[role="tab"]')
    await buttons[1]?.trigger('click')

    expect(w.text()).toContain('Mittelschülerkartellverbandes')
    expect(w.text()).not.toContain('Als Mittelschülerverbindung')
  })

  it('marks the active tab with aria-selected', async () => {
    const w = mount(AboutSection)
    const buttons = w.findAll('button[role="tab"]')
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
    expect(buttons[1]?.attributes('aria-selected')).toBe('false')

    await buttons[2]?.trigger('click')
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')
  })

  it('embeds the MKV YouTube video, independent of the active tab', async () => {
    const w = mount(AboutSection)
    expect(w.text()).toContain('Erfahre mehr über den MKV')

    const iframe = w.find('iframe')
    expect(iframe.attributes('src')).toContain('youtube.com/embed/Sh51ebB2G8A')

    const buttons = w.findAll('button[role="tab"]')
    await buttons[1]?.trigger('click')
    expect(w.find('iframe').exists()).toBe(true)
  })

  it('links to the Stolpersteine page in the first tab', () => {
    const w = mount(AboutSection)
    const link = w.find('a[href="https://niemalswieder.at/Stolpersteine/Steine/1368"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener')
  })

  it('lists all six friendship connections in the MKV tab', async () => {
    const w = mount(AboutSection)
    const buttons = w.findAll('button[role="tab"]')
    await buttons[1]?.trigger('click')

    expect(w.text()).toContain('Unsere Freundschaftsverbindungen:')
    for (const name of [
      'K.Ö.St.V. Ostaricia Wien',
      'K.Ö.St.V. Kreuzenstein Wien',
      'K.Ö.St.V. Rugia Waidhofen/Thaya',
      'GV Zähringia Freiburg',
      'K.Ö.St.V. Donaumark',
      'K.Ö.St.V. Vindobona nova',
    ]) {
      expect(w.text()).toContain(name)
    }
  })
})
