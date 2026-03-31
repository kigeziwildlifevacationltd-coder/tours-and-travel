import { Link, useLocation } from 'react-router-dom'
import { destinations, navItems, services, stats, tours } from '../data/siteContent'
import { useTranslation } from '../context/useTranslation'
import { useRuntimeTranslatedList } from '../hooks/useRuntimeTranslation'
import { prefetchRoute } from '../utils/routePrefetch'
import brandLogo from '../assets/logo.png'

const featuredTours = tours.slice(0, 8)
const featuredServices = services.slice(0, 10)
const featuredDestinations = destinations.slice(0, 8)
const featuredTourLabelSeeds = featuredTours.map((tour) => tour.title)
const featuredServiceLabelSeeds = featuredServices.map((service) => service.name)
const featuredDestinationLabelSeeds = featuredDestinations.map((destination) => destination.name)
const footerNavItems = [
  ...navItems,
  { label: 'Experiences', to: '/experiences' },
  { label: 'Site Map', to: '/site-map' },
]
const footerAnchorId = 'page-content'
const withFooterAnchor = (to: string) => (to.includes('#') ? to : `${to}#${footerAnchorId}`)
export function Footer() {
  const { t } = useTranslation()
  const location = useLocation()
  const year = new Date().getFullYear()
  const translatedFeaturedTourLabels = useRuntimeTranslatedList(featuredTourLabelSeeds)
  const translatedFeaturedServiceLabels = useRuntimeTranslatedList(featuredServiceLabelSeeds)
  const translatedFeaturedDestinationLabels = useRuntimeTranslatedList(featuredDestinationLabelSeeds)
  const partnerLogos = [
    {
      src: '/images/partner-motwa.png',
      alt: 'Ministry of Tourism, Wildlife and Antiquities',
      href: 'https://www.tourism.go.ug/',
    },
    {
      src: '/images/partner-uganda-tourism-board.png',
      alt: 'Uganda Tourism Board',
      href: 'https://utb.go.ug/',
    },
    {
      src: '/images/partner-uganda-wildlife-authority.jpg',
      alt: 'Uganda Wildlife Authority',
      href: 'https://www.ugandawildlife.org/',
    },
    {
      src: '/images/partner-get-your-guide.png',
      alt: 'Get Your Guide',
      href: 'https://www.getyourguide.com/',
    },
    {
      src: '/images/partner-safari-bookings.png',
      alt: 'Safari Bookings',
      href: 'https://www.safaribookings.com/',
    },
    { src: '/images/partner-tour-radar.png', alt: 'Tour Radar', href: 'https://www.tourradar.com/' },
    {
      src: '/images/partner-trip-advisor.png',
      alt: 'Trip Advisor',
      href: 'https://www.tripadvisor.com/',
    },
  ]

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

    if (to === '/site-map') {
      return t('nav.siteMap')
    }

    return fallbackLabel
  }

  const handleFooterLinkClick = (to: string) => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(to, window.location.origin)

    if (url.pathname !== location.pathname || url.hash !== location.hash) {
      return
    }

    const targetId = url.hash.replace('#', '')

    if (targetId) {
      const target = document.getElementById(targetId)

      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0 })
  }

  const getStatLabel = (label: string) => {
    if (label === 'Years Of Field Experience') {
      return t('stats.yearsExperience')
    }

    if (label === 'Planned Itineraries') {
      return t('stats.plannedItineraries')
    }

    if (label === 'National Parks Covered') {
      return t('stats.parksCovered')
    }

    if (label === 'Client Satisfaction') {
      return t('stats.clientSatisfaction')
    }

    return label
  }

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <section className="footer-overview">
          <p className="footer-brand">
            <img
              src={brandLogo}
              alt={t('brand.logoAlt')}
              className="footer-logo"
              loading="lazy"
              decoding="async"
            />
            <span>{t('footer.brand')}</span>
          </p>
          <p className="footer-copy">{t('footer.summary')}</p>
          <p className="footer-copy">{t('footer.summaryDetail')}</p>
          <div className="footer-action-row">
            <Link
              to="/tours?openCustomTour=1#custom-tour-request"
              className="btn btn-primary footer-btn"
              onClick={() => handleFooterLinkClick('/tours?openCustomTour=1#custom-tour-request')}
              onMouseEnter={() => prefetchRoute('/tours')}
              onFocus={() => prefetchRoute('/tours')}
            >
              {t('footer.planTrip')}
            </Link>
            <Link
              to={withFooterAnchor('/tours')}
              className="btn btn-ghost footer-btn"
              onClick={() => handleFooterLinkClick(withFooterAnchor('/tours'))}
              onMouseEnter={() => prefetchRoute('/tours')}
              onFocus={() => prefetchRoute('/tours')}
            >
              {t('footer.viewTours')}
            </Link>
          </div>
          <p className="footer-detail-line">
            <span>
              {t('footer.phone')}: {t('common.phonePrimaryValue')}
            </span>
            <span>
              {t('footer.email')}: {t('common.emailValue')}
            </span>
            <span>
              {t('footer.office')}: {t('common.officeValue')}
            </span>
          </p>
          <p className="footer-detail-line">
            <span>
              {t('footer.hours')}: {t('common.hoursValue')}
            </span>
            <span>
              {t('footer.customRequests')}: {t('common.customRequestsValue')}
            </span>
          </p>
          <div className="footer-stats">
            {stats.map((item) => (
              <div key={item.label} className="footer-stat">
                <p className="footer-stat-value">{item.value}</p>
                <p className="footer-stat-label">{getStatLabel(item.label)}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="footer-grid">
          <section className="footer-links-group" aria-label={t('footer.ariaPageLinks')}>
            <p className="footer-links-title">{t('footer.pages')}</p>
            <nav className="footer-links-list">
              {footerNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={withFooterAnchor(item.to)}
                  className="footer-mini-link"
                  onClick={() => handleFooterLinkClick(withFooterAnchor(item.to))}
                  onMouseEnter={() => prefetchRoute(item.to)}
                  onFocus={() => prefetchRoute(item.to)}
                >
                  {getNavLabel(item.to, item.label)}
                </Link>
              ))}
            </nav>
          </section>

          <section className="footer-links-group" aria-label={t('footer.ariaTourLinks')}>
            <p className="footer-links-title">{t('footer.topTours')}</p>
            <nav className="footer-links-list">
              {featuredTours.map((tour, index) => (
                <Link
                  key={tour.id}
                  to={withFooterAnchor(`/tours/${tour.id}`)}
                  className="footer-mini-link"
                  onClick={() => handleFooterLinkClick(withFooterAnchor(`/tours/${tour.id}`))}
                  onMouseEnter={() => prefetchRoute(`/tours/${tour.id}`)}
                  onFocus={() => prefetchRoute(`/tours/${tour.id}`)}
                >
                  {translatedFeaturedTourLabels[index] ?? tour.title}
                </Link>
              ))}
            </nav>
          </section>

          <section className="footer-links-group" aria-label={t('footer.ariaServiceLinks')}>
            <p className="footer-links-title">{t('footer.coreServices')}</p>
            <nav className="footer-links-list">
              {featuredServices.map((service, index) => (
                <Link
                  key={service.id}
                  to={withFooterAnchor(`/services/${service.id}`)}
                  className="footer-mini-link"
                  onClick={() => handleFooterLinkClick(withFooterAnchor(`/services/${service.id}`))}
                  onMouseEnter={() => prefetchRoute(`/services/${service.id}`)}
                  onFocus={() => prefetchRoute(`/services/${service.id}`)}
                >
                  {translatedFeaturedServiceLabels[index] ?? service.name}
                </Link>
              ))}
            </nav>
          </section>

          <section className="footer-links-group" aria-label={t('footer.ariaDestinationLinks')}>
            <p className="footer-links-title">{t('footer.topDestinations')}</p>
            <nav className="footer-links-list">
              {featuredDestinations.map((destination, index) => (
                <Link
                  key={destination.id}
                  to={withFooterAnchor(`/destinations#${destination.id}`)}
                  className="footer-mini-link"
                  onClick={() =>
                    handleFooterLinkClick(withFooterAnchor(`/destinations#${destination.id}`))
                  }
                  onMouseEnter={() => prefetchRoute('/destinations')}
                  onFocus={() => prefetchRoute('/destinations')}
                >
                  {translatedFeaturedDestinationLabels[index] ?? destination.name}
                </Link>
              ))}
            </nav>
          </section>
        </div>

        <section className="footer-support">
          <p className="footer-links-title">{t('footer.supportTitle')}</p>
          <p className="footer-copy">{t('footer.supportSummary')}</p>
          <ul className="footer-support-list">
            <li>{t('footer.supportItem1')}</li>
            <li>{t('footer.supportItem2')}</li>
            <li>{t('footer.supportItem3')}</li>
            <li>{t('footer.supportItem4')}</li>
          </ul>
        </section>

        <section className="footer-partners" aria-label={t('footer.ariaPartners')}>
          <p className="footer-links-title">{t('footer.partners')}</p>
          <div className="footer-partner-logos">
            {partnerLogos.map((partner) => (
              <figure key={partner.alt} className="footer-partner-item">
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-partner-link"
                  aria-label={`${t('footer.visitPartnerWebsite')} ${partner.alt}`}
                >
                  <img
                    src={partner.src}
                    alt={partner.alt}
                    className="footer-partner-logo"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width={320}
                    height={120}
                  />
                </a>
              </figure>
            ))}
          </div>
        </section>

        <div className="footer-bottom">
          <p className="footer-copy">
            {t('footer.copyright')} {year} {t('brand.name')}
          </p>
          <p className="footer-copy">
            Developed by Atwijuka Kevin.{' '}
            <a href="mailto:atwijukakevint@gmail.com">atwijukakevint@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
