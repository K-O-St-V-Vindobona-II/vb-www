import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgrammSection from '../ProgrammSection.vue'

describe('ProgrammSection', () => {
  it('embeds the shared Google Calendar', () => {
    const w = mount(ProgrammSection)
    const iframe = w.find('iframe')
    expect(iframe.attributes('src')).toContain(
      encodeURIComponent('h7d2qp0jlg603cvq2aabdn2k5o@group.calendar.google.com'),
    )
  })

  it('shows the Hinweise text', () => {
    const w = mount(ProgrammSection)
    expect(w.text()).toContain('c.t.')
    expect(w.text()).toContain('Bude Vindobonae')
  })

  it('links to the .ical download of the shared calendar', () => {
    const w = mount(ProgrammSection)
    const link = w.find('.ical-link')
    expect(link.text()).toContain('Kalender als .ical herunterladen')
    expect(link.attributes('href')).toBe(
      'https://calendar.google.com/calendar/ical/h7d2qp0jlg603cvq2aabdn2k5o%40group.calendar.google.com/public/basic.ics',
    )
  })
})
