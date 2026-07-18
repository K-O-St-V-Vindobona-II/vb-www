import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TestimonialsSection from '../TestimonialsSection.vue'

describe('TestimonialsSection', () => {
  it('shows both restored testimonial quotes with their authors', () => {
    const w = mount(TestimonialsSection)

    expect(w.text()).toContain(
      'Als ich das erste Mal bei einer Verbindung war, war ich sofort begeistert und fühlte mich in der Gemeinschaft aufgehoben.',
    )
    expect(w.text()).toContain('Ein Fuchs')
    expect(w.text()).toContain(
      'Durch die Verbindung hab ich herausgefunden, was mich interessiert.',
    )
    expect(w.text()).toContain('Ein Junger Aktiver')
  })

  it('renders each testimonial as a blockquote', () => {
    const w = mount(TestimonialsSection)
    expect(w.findAll('blockquote')).toHaveLength(2)
  })
})
