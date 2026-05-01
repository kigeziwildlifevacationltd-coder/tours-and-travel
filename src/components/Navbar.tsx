import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { destinations, navItems, services, tours } from '../data/siteContent'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation } from '../context/useTranslation'
import { useRuntimeTranslatedList } from '../hooks/useRuntimeTranslation'
import { prefetchRoute } from '../utils/routePrefetch'
import brandLogo from '../assets/logo.png'
import {
  BUSINESS_CONTACT_EMAIL,
  BUSINESS_CONTACT_EMAIL_SECONDARY,
  BUSINESS_PHONE_PRIMARY,
  BUSINESS_PHONE_SECONDARY,
  BUSINESS_PHONE_TERTIARY,
} from '../utils/businessInfo'

type DropdownItem = {
  label: string
  to: string
}

const tourTitleSeeds = tours.map((tour) => tour.title)
const serviceNameSeeds = services.map((service) => service.name)
const destinationNameSeeds = destinations.map((destination) => destination.name)
const PAGE_CONTENT_HASH = '#page-content'

type SocialLink = {
  href: string
  label: string
  icon: ReactNode
}

const socialIconBaseProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const emailIcon = (
  <svg aria-hidden="true" focusable="false" {...socialIconBaseProps}>
    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    <path d="m4 8 8 5 8-5" />
  </svg>
)

const phoneIcon = (
  <svg aria-hidden="true" focusable="false" {...socialIconBaseProps}>
    <path d="M5 4.5h4l1.2 4-2.2 1.4a13.5 13.5 0 0 0 6 6l1.4-2.2 4 1.2v4a2 2 0 0 1-2 2C9.7 21.1 2.9 14.3 3 6.5a2 2 0 0 1 2-2z" />
  </svg>
)

const instagramIcon = (
  <svg aria-hidden="true" focusable="false" {...socialIconBaseProps}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" />
  </svg>
)

const facebookIcon = (
  <svg aria-hidden="true" focusable="false" {...socialIconBaseProps}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const xIcon = (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M4 4h4.3l3.2 4.6L15.3 4H20l-6 7.8L20.6 20h-4.3l-3.7-5.2L9 20H4.3l6.4-8.3L4 4z" />
  </svg>
)

const musicNoteIcon = (
  <svg aria-hidden="true" focusable="false" {...socialIconBaseProps}>
    <path d="M14 4v10.5a3.5 3.5 0 1 1-2-3.1V6l6-2v4" />
  </svg>
)

const youtubeIcon = (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C18 4.8 12 4.8 12 4.8s-6 0-7.6.4a2.8 2.8 0 0 0-2 2 28 28 0 0 0-.4 4.8 28 28 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.6.4 7.6.4 7.6.4s6 0 7.6-.4a2.8 2.8 0 0 0 2-2 28 28 0 0 0 .4-4.8 28 28 0 0 0-.4-4.8z" />
    <path d="M10 9.5v5l5-2.5-5-2.5z" fill="#0b120f" />
  </svg>
)

const linkIcon = (
  <svg aria-hidden="true" focusable="false" {...socialIconBaseProps}>
    <path d="M10.5 13.5 8 16a3 3 0 0 1-4.2 0 3 3 0 0 1 0-4.2l2.5-2.5" />
    <path d="M13.5 10.5 16 8a3 3 0 0 1 4.2 0 3 3 0 0 1 0 4.2l-2.5 2.5" />
    <path d="M9 15l6-6" />
  </svg>
)

const SOCIAL_ICON_MAP: Array<{ label: string; match: RegExp; icon: ReactElement }> = [
  { label: 'Instagram', match: /instagram\.com/i, icon: instagramIcon },
  { label: 'Facebook', match: /facebook\.com/i, icon: facebookIcon },
  { label: 'X', match: /x\.com|twitter\.com/i, icon: xIcon },
  { label: 'TikTok', match: /tiktok\.com/i, icon: musicNoteIcon },
  { label: 'YouTube', match: /youtube\.com|youtu\.be/i, icon: youtubeIcon },
]

const rawSocialLinks = (import.meta.env.VITE_BUSINESS_SOCIAL_LINKS as string | undefined)
  ?.split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0) ?? []

const socialLinks: SocialLink[] = rawSocialLinks
  .map((href) => {
    const match = SOCIAL_ICON_MAP.find((entry) => entry.match.test(href))
    return {
      href,
      label: match?.label ?? 'Social link',
      icon: match?.icon ?? linkIcon,
    }
  })
  .filter(
    (item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index,
  )

const contactPhones = [BUSINESS_PHONE_PRIMARY, BUSINESS_PHONE_SECONDARY, BUSINESS_PHONE_TERTIARY].filter(
  (value) => value && value.trim().length > 0,
)

const contactEmails = [BUSINESS_CONTACT_EMAIL, BUSINESS_CONTACT_EMAIL_SECONDARY].filter(
  (value) => value && value.trim().length > 0,
)

const formatTelLink = (value: string) => `tel:${value.replace(/\s+/g, '')}`
export function Navbar() {
  const location = useLocation()
  const navShellRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const { t } = useTranslation()
  const translatedTourLabels = useRuntimeTranslatedList(tourTitleSeeds)
  const translatedServiceLabels = useRuntimeTranslatedList(serviceNameSeeds)
  const translatedDestinationLabels = useRuntimeTranslatedList(destinationNameSeeds)

  const tourItems: DropdownItem[] = useMemo(
    () =>
      tours.map((tour, index) => ({
        label: translatedTourLabels[index] ?? tour.title,
        to: `/tours/${tour.id}`,
      })),
    [translatedTourLabels],
  )
  const serviceItems: DropdownItem[] = useMemo(
    () =>
      services.map((service, index) => ({
        label: translatedServiceLabels[index] ?? service.name,
        to: `/services/${service.id}`,
      })),
    [translatedServiceLabels],
  )
  const destinationItems: DropdownItem[] = useMemo(
    () =>
      destinations.map((destination, index) => ({
        label: translatedDestinationLabels[index] ?? destination.name,
        to: `/destinations#${destination.id}`,
      })),
    [translatedDestinationLabels],
  )

  const handleNavClose = () => {
    setOpen(false)
    setExpandedMenu(null)
  }

  useEffect(() => {
    handleNavClose()
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!open || !window.matchMedia('(max-width: 960px)').matches) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (typeof window === 'undefined' || !open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleNavClose()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!navShellRef.current?.contains(target)) {
        handleNavClose()
      }
    }

    const handleResize = () => {
      if (!window.matchMedia('(max-width: 960px)').matches) {
        handleNavClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  const getDropdownItems = (to: string) => {
    if (to === '/tours') {
      return tourItems
    }

    if (to === '/services') {
      return serviceItems
    }

    if (to === '/destinations') {
      return destinationItems
    }

    return null
  }

  const getNavLabel = (to: string, fallbackLabel: string) => {
    if (to === '/') {
      return t('nav.home')
    }

    if (to === '/services') {
      return t('nav.services')
    }

    if (to === '/destinations') {
      return t('nav.destinations')
    }

    if (to === '/tours') {
      return t('nav.tours')
    }

    if (to === '/about') {
      return t('nav.about')
    }

    if (to === '/gallery') {
      return t('nav.gallery')
    }

    if (to === '/experiences') {
      return t('nav.experiences')
    }

    if (to === '/contact-us') {
      return t('nav.contact')
    }

    return fallbackLabel
  }

  const getNavTarget = (to: string) => {
    if (to.includes('#')) {
      return to
    }

    if (to.includes('?')) {
      const [path, query] = to.split('?')
      return `${path}?${query}${PAGE_CONTENT_HASH}`
    }

    return `${to}${PAGE_CONTENT_HASH}`
  }

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container nav-container topbar-inner">
          <div className="topbar-contact">
            <div className="topbar-group">
              <span className="topbar-icon" aria-hidden="true">
                {emailIcon}
              </span>
              <span className="topbar-label">{t('footer.email')}:</span>
              {contactEmails.length > 0 ? (
                <>
                  <a className="topbar-link" href={`mailto:${contactEmails[0]}`}>
                    {contactEmails[0]}
                  </a>
                  {contactEmails.slice(1).map((email) => (
                    <span key={email} className="topbar-secondary">
                      <span className="topbar-sub-divider" aria-hidden="true">
                        /
                      </span>
                      <a className="topbar-link" href={`mailto:${email}`}>
                        {email}
                      </a>
                    </span>
                  ))}
                </>
              ) : (
                <span className="topbar-link">{BUSINESS_CONTACT_EMAIL}</span>
              )}
            </div>
            {contactPhones.length > 0 ? <span className="topbar-divider" aria-hidden="true">|</span> : null}
            {contactPhones.length > 0 ? (
              <div className="topbar-group">
                <span className="topbar-icon" aria-hidden="true">
                  {phoneIcon}
                </span>
                <span className="topbar-label">{t('footer.phone')}:</span>
                <a className="topbar-link" href={formatTelLink(contactPhones[0])}>
                  {contactPhones[0]}
                </a>
                {contactPhones.slice(1).map((phone) => (
                  <span key={phone} className="topbar-secondary">
                    <span className="topbar-sub-divider" aria-hidden="true">
                      /
                    </span>
                    <a className="topbar-link" href={formatTelLink(phone)}>
                      {phone}
                    </a>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {socialLinks.length > 0 ? (
            <div className="topbar-social" aria-label="Social media">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="topbar-social-link"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div ref={navShellRef} className="container nav-container nav-shell">
        <NavLink
          to={getNavTarget('/')}
          className="brand-mark"
          onClick={handleNavClose}
          onMouseEnter={() => prefetchRoute(getNavTarget('/'))}
          onFocus={() => prefetchRoute(getNavTarget('/'))}
        >
          <img
            src={brandLogo}
            alt={t('brand.logoAlt')}
            className="brand-logo"
            fetchPriority="high"
            decoding="async"
          />
          <span className="brand-name">{t('brand.name')}</span>
        </NavLink>

        <button
          className={`menu-toggle ${open ? 'open' : ''}`}
          type="button"
          aria-label={t('a11y.toggleNavigation')}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-navigation"
          className={`nav-links ${open ? 'open' : ''}`}
          aria-label={t('a11y.mainNavigation')}
        >
          {navItems.map((item) => {
            const dropdownItems = getDropdownItems(item.to)
            const hasDropdown = Boolean(dropdownItems)
            const isExpanded = expandedMenu === item.to
            const label = getNavLabel(item.to, item.label)
            const navTarget = getNavTarget(item.to)

            return (
              <div
                key={item.to}
                className={`nav-item ${hasDropdown ? 'has-dropdown' : ''} ${isExpanded ? 'expanded' : ''}`}
              >
                <NavLink
                  to={navTarget}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClose}
                  onMouseEnter={() => prefetchRoute(navTarget)}
                  onFocus={() => prefetchRoute(navTarget)}
                >
                  {label}
                </NavLink>

                {hasDropdown ? (
                  <>
                    <button
                      type="button"
                      className="submenu-toggle"
                      aria-label={`${t('a11y.toggleSubmenu')} ${label}`}
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedMenu((current) => (current === item.to ? null : item.to))
                      }
                    >
                      <span>{isExpanded ? '-' : '+'}</span>
                    </button>

                    <div className="dropdown-menu">
                      {dropdownItems!.map((dropdownItem) => {
                        const dropdownTarget = getNavTarget(dropdownItem.to)
                        return (
                          <Link
                            key={dropdownItem.to}
                            to={dropdownTarget}
                            className="dropdown-link"
                            onClick={handleNavClose}
                            onMouseEnter={() => prefetchRoute(dropdownTarget)}
                            onFocus={() => prefetchRoute(dropdownTarget)}
                          >
                            {dropdownItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            )
          })}

          <LanguageSwitcher />

          <Link
            to="/tours?openCustomTour=1#custom-tour-request"
            className="btn btn-ghost nav-cta"
            onClick={handleNavClose}
            onMouseEnter={() => prefetchRoute('/tours')}
            onFocus={() => prefetchRoute('/tours')}
          >
            {t('nav.planTrip')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
