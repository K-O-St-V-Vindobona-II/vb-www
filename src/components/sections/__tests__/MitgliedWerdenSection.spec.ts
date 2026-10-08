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

  it('lists the steps as a numbered list in the order of the path into the club', () => {
    const w = mount(MitgliedWerdenSection)
    const steps = w.findAll('ol.timeline > li')

    expect(steps.map((step) => step.find('.step-number').text())).toEqual(['1', '2', '3'])
    expect(steps.map((step) => step.find('h3').text())).toEqual([
      'Komm vorbei',
      'Lerne uns als Fuchs kennen',
      'Werde aktiver Bursch bei uns',
    ])
  })

  it('explains every step with a text of its own', () => {
    const w = mount(MitgliedWerdenSection)
    const texts = w.findAll('.step-body p').map((p) => p.text())

    expect(texts).toHaveLength(3)
    expect(new Set(texts).size).toBe(3)
    expect(texts.every((text) => text.length > 20)).toBe(true)
  })

  it('has the anchor the menu links to and a heading', () => {
    const w = mount(MitgliedWerdenSection)

    expect(w.find('section').attributes('id')).toBe('mitglied-werden')
    expect(w.find('h2').text()).toBe('Wie du Mitglied werden kannst…')
  })
})
