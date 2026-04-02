import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { TourCard } from '../components/TourCard'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { services, stats, tours } from '../data/siteContent'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

const homeTourKeywords = buildEntityKeywordCluster(
  'tour',
  tours.map((tour) => tour.title),
  24,
)
const homeServiceKeywords = buildEntityKeywordCluster(
  'service',
  services.map((service) => service.name),
  20,
)
const homeKeywordCluster = buildPageKeywordCluster(
  UGANDA_SAFARI_KEYWORDS,
  GORILLA_TREKKING_KEYWORDS,
  [...homeTourKeywords, ...homeServiceKeywords],
  130,
)

const homeSeoFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is included in Uganda safari tour packages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Our Uganda safari packages can include wildlife game drives, gorilla trekking permits, accommodations, park fees, private or group transport, and custom itinerary planning.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does a Uganda safari cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Uganda safari price and cost depend on duration, travel season, accommodation level, and whether you choose private, luxury, budget, or small-group safari tours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I book gorilla trekking in Uganda online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. We support gorilla trekking booking, permit guidance, and full safari holiday planning for Bwindi and related Uganda wildlife adventure tours.',
      },
    },
  ],
}

export function HomePage() {
  const { t } = useTranslation()
  const requestTourUrl = '/tours?openCustomTour=1#custom-tour-request'

  usePageSeo({
    title: t('home.heroTitle'),
    description: t('home.heroDescription'),
    path: '/',
    image: '/images/mountain-road-panorama-0046.jpg',
    imageAlt: 'Uganda safari tours and gorilla trekking adventure planning',
    preloadImage: '/images/mountain-road-panorama-0046.jpg',
    keywords: homeKeywordCluster,
    structuredData: homeSeoFaqSchema,
  })

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
    <>
      <PageHero
        title=""
        description=""
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('home.heroActionBrowseTours'), to: '/tours' },
          { label: t('home.heroActionContact'), to: requestTourUrl, variant: 'accent' },
        ]}
        backgroundImages={heroBackgroundImages}
        backgroundIntervalMs={5500}
        showScrollCue
        scrollCueTargetId="featured-tours"
      />

      <section id="featured-tours" className="section">
        <div className="container">
          <SectionHeading
            title={`${tours.length} ${t('tours.availableToursSuffix')}`}
            subtitle={t('tours.availableToursSubtitle')}
          />
          <div className="card-grid tours-grid">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            title={t('home.whyChooseTitle')}
            subtitle={t('home.whyChooseSubtitle')}
          />
          <div className="card-grid feature-grid">
            <article className="content-card feature-card">
              <h3>{t('home.feature1Title')}</h3>
              <p>{t('home.feature1Body')}</p>
            </article>
            <article className="content-card feature-card">
              <h3>{t('home.feature2Title')}</h3>
              <p>{t('home.feature2Body')}</p>
            </article>
            <article className="content-card feature-card">
              <h3>{t('home.feature3Title')}</h3>
              <p>{t('home.feature3Body')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            title={t('home.coreServicesTitle')}
            subtitle={t('home.coreServicesSubtitle')}
          />
          <div className="card-grid services-grid">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className="section-actions">
            <Link to="/services" className="btn btn-secondary">
              {t('home.exploreServices')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title={t('home.businessSnapshotTitle')} />
          <div className="stats-grid">
            {stats.map((item) => (
              <article key={item.label} className="stat-card">
                <p className="stat-value">{item.value}</p>
                <p className="stat-label">{getStatLabel(item.label)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <article className="content-card">
            <SectionHeading
              title={t('home.planningGuideTitle')}
              subtitle={t('home.planningGuideSubtitle')}
            />
            <p>{t('home.planningGuideParagraph1')}</p>
            <p>{t('home.planningGuideParagraph2')}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ExperienceCallout align="center" />
        </div>
      </section>
    </>
  )
}
