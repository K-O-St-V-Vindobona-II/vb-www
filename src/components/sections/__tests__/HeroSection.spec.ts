import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../HeroSection.vue'

describe('HeroSection', () => {
  it('shows the name and tagline', () => {
    const w = mount(HeroSection)
    expect(w.text()).toContain('Vindobona II')
    expect(w.text()).toContain('Deine Verbindung in Wien')
  })
})
