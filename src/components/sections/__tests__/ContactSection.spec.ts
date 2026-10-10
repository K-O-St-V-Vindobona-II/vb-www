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
    const honeypot = w.find('input.honeypot')
    expect(honeypot.exists()).toBe(true)
    expect(honeypot.attributes('aria-hidden')).toBe('true')
    expect(honeypot.attributes('tabindex')).toBe('-1')
    expect(honeypot.attributes('autocomplete')).toBe('off')
  })

  it('names the honeypot so that form fillers do not take it for a website field', () => {
    const w = mount(ContactSection)

    expect(w.find('input[name="website"]').exists()).toBe(false)
    expect(w.find('input.honeypot').attributes('name')).toBe('contact-trap')
  })

  it('forwards a filled-in honeypot value to the backend for rejection', async () => {
    // Real visitors never see/fill this field (hidden via CSS); a bot that
    // blindly fills every input trips the backend's honeypot check because
    // this value ends up non-empty in the payload.
    mockSubmitContactForm.mockResolvedValue(undefined)
    const w = mount(ContactSection)

    await w.find('input[type="text"]').setValue('Max Mustermann')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo!')
    await w.find('input.honeypot').setValue('http://spam.example')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(mockSubmitContactForm).toHaveBeenCalledWith(
      expect.objectContaining({ website: 'http://spam.example' }),
    )
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
    expect((w.find('input[type="email"]').element as HTMLInputElement).value).toBe('')
    expect((w.find('textarea').element as HTMLTextAreaElement).value).toBe('')
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

  it('shows a generic error message when the rejection is not an Error instance', async () => {
    mockSubmitContactForm.mockRejectedValue('network down')
    const w = mount(ContactSection)

    await w.find('input[type="text"]').setValue('Max')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo!')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(w.text()).toContain('Nachricht konnte nicht gesendet werden.')
  })

  it('shows the club address as visible text next to the map', () => {
    const w = mount(ContactSection)
    expect(w.text()).toContain('K.Ö.St.V. Vindobona II Wien')
    expect(w.text()).toContain('Rooseveltplatz 8/Sout.')
    expect(w.text()).toContain('1090 Wien')
    expect(w.text()).toContain('Bitte bei „Vindobona“ anläuten!')
  })

  it('embeds the map from OpenStreetMap with an explicit referrer policy', () => {
    const w = mount(ContactSection)
    const frame = w.find('iframe[title="Standort"]')
    expect(frame.attributes('src')).toMatch(
      /^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?/,
    )
    expect(frame.attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin')
    expect(frame.attributes('loading')).toBe('lazy')
  })

  it('titles the section', () => {
    const w = mount(ContactSection)
    expect(w.find('h2').text()).toBe('Kontaktiere uns!')
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

  async function fillAndSubmit(w: ReturnType<typeof mount>) {
    await w.find('input[type="text"]').setValue('Max')
    await w.find('input[type="email"]').setValue('max@example.com')
    await w.find('textarea').setValue('Hallo!')
    await w.find('form').trigger('submit')
    await flushPromises()
  }

  it('keeps what the visitor typed when sending fails, so nothing has to be typed again', async () => {
    mockSubmitContactForm.mockRejectedValue(new Error('Serverfehler'))
    const w = mount(ContactSection)

    await fillAndSubmit(w)

    expect((w.find('input[type="text"]').element as HTMLInputElement).value).toBe('Max')
    expect((w.find('input[type="email"]').element as HTMLInputElement).value).toBe(
      'max@example.com',
    )
    expect((w.find('textarea').element as HTMLTextAreaElement).value).toBe('Hallo!')
    expect(w.find('.form-message.success').exists()).toBe(false)
  })

  it('shows either the success or the error message, never a stale one', async () => {
    mockSubmitContactForm.mockRejectedValueOnce(new Error('Serverfehler'))
    const w = mount(ContactSection)
    await fillAndSubmit(w)
    expect(w.find('.form-message.error').exists()).toBe(true)

    mockSubmitContactForm.mockResolvedValueOnce(undefined)
    await fillAndSubmit(w)
    expect(w.find('.form-message.error').exists()).toBe(false)
    expect(w.find('.form-message.success').exists()).toBe(true)

    mockSubmitContactForm.mockRejectedValueOnce(new Error('Wieder ein Fehler'))
    await fillAndSubmit(w)
    expect(w.find('.form-message.success').exists()).toBe(false)
    expect(w.find('.form-message.error').text()).toBe('Wieder ein Fehler')
  })

  it('announces the result to screen readers', async () => {
    mockSubmitContactForm.mockResolvedValueOnce(undefined)
    const w = mount(ContactSection)
    await fillAndSubmit(w)
    expect(w.find('.form-message.success').attributes('role')).toBe('status')

    mockSubmitContactForm.mockRejectedValueOnce(new Error('Serverfehler'))
    await fillAndSubmit(w)
    expect(w.find('.form-message.error').attributes('role')).toBe('alert')
  })

  it('labels the button while sending and returns to "Senden" afterwards', async () => {
    let finish: () => void = () => {}
    mockSubmitContactForm.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve
      }),
    )
    const w = mount(ContactSection)
    expect(w.find('button[type="submit"]').text()).toBe('Senden')

    await fillAndSubmit(w)
    expect(w.find('button[type="submit"]').text()).toBe('Wird gesendet…')

    finish()
    await flushPromises()
    expect(w.find('button[type="submit"]').text()).toBe('Senden')
  })

  it('requires name, e-mail address and message and limits their length like the API', () => {
    const w = mount(ContactSection)

    expect(w.find('#contact-name').attributes()).toMatchObject({ required: '', maxlength: '100' })
    expect(w.find('#contact-email').attributes()).toMatchObject({ required: '', type: 'email' })
    expect(w.find('#contact-message').attributes()).toMatchObject({
      required: '',
      maxlength: '4000',
    })
  })

  it('gives every field a label that points at it', () => {
    const w = mount(ContactSection)

    for (const id of ['contact-name', 'contact-email', 'contact-message']) {
      expect(w.find(`label[for="${id}"]`).exists(), id).toBe(true)
    }
  })
})
