import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LinkedParagraphs from '../LinkedParagraphs.vue'

describe('LinkedParagraphs', () => {
  it('renders one <p> per paragraph', () => {
    const wrapper = mount(LinkedParagraphs, {
      props: { text: 'Erster Absatz.\n\nZweiter Absatz.' },
    })
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.text()).toBe('Erster Absatz.')
    expect(paragraphs[1]?.text()).toBe('Zweiter Absatz.')
  })

  it('renders a real <a> element for a link segment', () => {
    const wrapper = mount(LinkedParagraphs, {
      props: { text: 'Schau [hier](https://example.com) vorbei.' },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener')
    expect(link.text()).toBe('hier')
  })

  it('never renders a link for a javascript: URL', () => {
    const wrapper = mount(LinkedParagraphs, {
      props: { text: 'Klick [hier](javascript:alert(1)) für mehr.' },
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('[hier](javascript:alert(1))')
  })

  it('does not use v-html anywhere (no raw markup injection)', () => {
    const wrapper = mount(LinkedParagraphs, {
      props: { text: '<img src=x onerror=alert(1)>' },
    })
    // The literal tag text must appear escaped as text content, not be
    // parsed as a real <img> element.
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('<img src=x onerror=alert(1)>')
  })
})
