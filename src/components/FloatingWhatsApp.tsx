import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { BUSINESS_PHONE_PRIMARY } from '../utils/businessInfo'

function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, '')
  return digits.length > 0 ? digits : '256772630450'
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function buildWhatsAppUrls(phone: string, text: string) {
  const trimmed = text.trim()
  const encodedText = trimmed.length > 0 ? encodeURIComponent(trimmed) : ''
  const appUrl = encodedText
    ? `whatsapp://send?phone=${phone}&text=${encodedText}`
    : `whatsapp://send?phone=${phone}`
  const webUrl = encodedText ? `https://wa.me/${phone}?text=${encodedText}` : `https://wa.me/${phone}`

  return { appUrl, webUrl }
}

const whatsappIcon = (
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path
      d="M19.1 17.7c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.4.3-.7.2a8.6 8.6 0 0 1-4.2-3.7c-.2-.3 0-.5.2-.7l.5-.6.4-.6c.1-.2.1-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.6-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.3 2.3 3.7 5.7 5c.8.3 1.5.5 2 .6.9.2 1.7.2 2.3.1.7-.1 2.1-.8 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.2-.3-.3-.6-.4z"
      fill="currentColor"
    />
    <path
      d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L5 29l7.3-1.9a12 12 0 0 0 3.7.6C22.6 27.7 28 22.4 28 15.8 28 9.2 22.6 3.9 16 3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const panelId = useId()
  const phone = normalizeWhatsAppNumber(BUSINESS_PHONE_PRIMARY)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { appUrl, webUrl } = buildWhatsAppUrls(phone, message)

    if (isMobileDevice()) {
      const fallbackTimer = window.setTimeout(() => {
        window.location.href = webUrl
      }, 1200)

      window.location.href = appUrl
      window.setTimeout(() => window.clearTimeout(fallbackTimer), 1500)
    } else {
      window.open(webUrl, '_blank', 'noopener,noreferrer')
    }
    setMessage('')
    setIsOpen(false)
  }

  return (
    <div className="whatsapp-widget">
      <button
        type="button"
        className="whatsapp-float"
        aria-label="Open WhatsApp message"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {whatsappIcon}
      </button>
      <div
        id={panelId}
        className={`whatsapp-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Send a WhatsApp message"
        aria-hidden={!isOpen}
      >
        <div className="whatsapp-panel-header">
          <span>WhatsApp</span>
          <button
            type="button"
            className="whatsapp-panel-close"
            aria-label="Close WhatsApp message"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
        <form className="whatsapp-form" onSubmit={handleSend}>
          <label className="visually-hidden" htmlFor={`${panelId}-message`}>
            Message
          </label>
          <textarea
            id={`${panelId}-message`}
            className="whatsapp-textarea"
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your message"
          />
          <div className="whatsapp-actions">
            <button type="submit" className="btn btn-primary whatsapp-send">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
