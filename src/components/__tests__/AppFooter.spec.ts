import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter', () => {
  it('shows the copyright notice with the current year', () => {
    const w = mount(AppFooter)
    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien')
    expect(w.text()).toContain(String(new Date().getFullYear()))
  })

  it('links to Facebook and the Impressum', () => {
    const w = mount(AppFooter)
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://www.facebook.com/vindobona2')
    expect(hrefs).toContain('#impressum')
  })
})
