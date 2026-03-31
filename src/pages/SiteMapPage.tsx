import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { useTranslation } from '../context/useTranslation'
import { destinations, services, tours } from '../data/siteContent'
import { usePageSeo } from '../seo/usePageSeo'

export function SiteMapPage() {
  const { t } = useTranslation()
  const pageLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.tours'), to: '/tours' },
    { label: t('nav.destinations'), to: '/destinations' },
    { label: t('nav.services'), to: '/services' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.gallery'), to: '/gallery' },
    { label: t('nav.experiences'), to: '/experiences' },
    { label: t('nav.contact'), to: '/contact-us' },
    { label: t('nav.siteMap'), to: '/site-map' },
  ]

  usePageSeo({
    title: t('siteMap.heroTitle'),
    description: t('siteMap.heroDescription'),
    path: '/site-map',
    image: '/images/mountain-road-panorama-0046.jpg',
    imageAlt: 'HTML sitemap for Kigezi Wildlife Vacation Safaris',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('siteMap.heroTitle'),
      description: t('siteMap.heroDescription'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          ...pageLinks.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            url: typeof window !== 'undefined' ? `${window.location.origin}${item.to}` : item.to,
          })),
          ...tours.map((tour, index) => ({
            '@type': 'ListItem',
            position: pageLinks.length + index + 1,
            name: tour.title,
            url:
              typeof window !== 'undefined'
                ? `${window.location.origin}/tours/${tour.id}`
                : `/tours/${tour.id}`,
          })),
        ],
      },
    },
  })

  return (
    <section className="section">
      <div className="container">
        <SectionHeading title={t('siteMap.heroTitle')} subtitle={t('siteMap.heroDescription')} />

        <div className="site-map-grid">
          <article className="content-card site-map-card">
            <h3>{t('siteMap.sectionPagesTitle')}</h3>
            <p>{t('siteMap.sectionPagesSubtitle')}</p>
            <nav className="site-map-links" aria-label={t('siteMap.sectionPagesTitle')}>
              {pageLinks.map((item) => (
                <Link key={item.to} to={item.to} className="site-map-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </article>

          <article className="content-card site-map-card">
            <h3>{t('siteMap.sectionToursTitle')}</h3>
            <p>{t('siteMap.sectionToursSubtitle')}</p>
            <nav className="site-map-links" aria-label={t('siteMap.sectionToursTitle')}>
              {tours.map((tour) => (
                <Link key={tour.id} to={`/tours/${tour.id}`} className="site-map-link">
                  {tour.title}
                </Link>
              ))}
            </nav>
          </article>

          <article className="content-card site-map-card">
            <h3>{t('siteMap.sectionServicesTitle')}</h3>
            <p>{t('siteMap.sectionServicesSubtitle')}</p>
            <nav className="site-map-links" aria-label={t('siteMap.sectionServicesTitle')}>
              {services.map((service) => (
                <Link key={service.id} to={`/services/${service.id}`} className="site-map-link">
                  {service.name}
                </Link>
              ))}
            </nav>
          </article>

          <article className="content-card site-map-card">
            <h3>{t('siteMap.sectionDestinationsTitle')}</h3>
            <p>{t('siteMap.sectionDestinationsSubtitle')}</p>
            <nav className="site-map-links" aria-label={t('siteMap.sectionDestinationsTitle')}>
              {destinations.map((destination) => (
                <Link
                  key={destination.id}
                  to={`/destinations#${destination.id}`}
                  className="site-map-link"
                >
                  {destination.name}
                </Link>
              ))}
            </nav>
          </article>
        </div>
      </div>
    </section>
  )
}
