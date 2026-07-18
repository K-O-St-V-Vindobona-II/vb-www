import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ContactSection from '../ContactSection.vue'

const mockSubmitContactForm = vi.fn()
vi.mock('@/services/api', () => ({
  submitContactForm: (...args: unknown[]) => mockSubmitContactForm(...args),
}))

describe('ContactSection', () => {
  beforeEach(() => {
    mockSubmitContactForm.mockReset()
  })

  it('renders a hidden honeypot field', () => {
    const w = mount(ContactSection)
    const honeypot = w.find('input[name="website"]')
    expect(honeypot.exists()).toBe(true)
    expect(honeypot.attributes('aria-hidden')).toBe('true')
  })

  it('submits the form with the entered values', async () => {
    mockSubmitContactForm.mockResolvedValue(undefined)
    const w = mount(ContactSection)

    await w.find('input[type="text"]').setValue('Max Mustermann')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo, ich interessiere mich für Vindobona II.')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(mockSubmitContactForm).toHaveBeenCalledWith({
      name: 'Max Mustermann',
      email: 'max@example.com',
      message: 'Hallo, ich interessiere mich für Vindobona II.',
      website: '',
    })
  })

  it('shows a success message and clears the form after submission', async () => {
    mockSubmitContactForm.mockResolvedValue(undefined)
    const w = mount(ContactSection)

    await w.find('input[type="text"]').setValue('Max')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo!')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(w.text()).toContain('Vielen Dank für deine Mitteilung. Sie wurde versandt.')
    expect((w.find('input[type="text"]').element as HTMLInputElement).value).toBe('')
  })

  it('shows an error message when submission fails', async () => {
    mockSubmitContactForm.mockRejectedValue(new Error('Serverfehler'))
    const w = mount(ContactSection)

    await w.find('input[type="text"]').setValue('Max')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo!')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(w.text()).toContain('Serverfehler')
  })

  it('shows the club address as visible text next to the map', () => {
    const w = mount(ContactSection)
    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien')
    expect(w.text()).toContain('Rooseveltplatz 8/Sout.')
    expect(w.text()).toContain('1090 Wien')
    expect(w.text()).toContain('Bitte bei „Vindobona“ anläuten!')
  })

  it('disables the submit button while submitting', async () => {
    let resolveSubmit: () => void = () => {}
    mockSubmitContactForm.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSubmit = resolve
      }),
    )
    const w = mount(ContactSection)

    await w.find('input[type="text"]').setValue('Max')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo!')
    await w.find('form').trigger('submit')

    const button = w.find('button')
    expect(button.attributes('disabled')).toBeDefined()

    resolveSubmit()
    await flushPromises()
    expect(w.find('button').attributes('disabled')).toBeUndefined()
  })
})
