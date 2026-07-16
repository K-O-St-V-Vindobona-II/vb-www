import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MitgliedWerdenSection from '../MitgliedWerdenSection.vue'

describe('MitgliedWerdenSection', () => {
  it('shows all three call-to-action cards', () => {
    const w = mount(MitgliedWerdenSection)
    expect(w.text()).toContain('Komm vorbei')
    expect(w.text()).toContain('Lerne uns als Fuchs kennen')
    expect(w.text()).toContain('Werde aktiver Bursch bei uns')
  })
})
