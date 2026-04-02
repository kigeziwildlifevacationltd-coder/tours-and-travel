import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { services } from '../data/siteContent'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

const servicesEntityKeywords = buildEntityKeywordCluster(
  'service',
  services.map((service) => service.name),
  40,
)
const servicesPageKeywordCluster = buildPageKeywordCluster(
  UGANDA_SAFARI_KEYWORDS,
  GORILLA_TREKKING_KEYWORDS,
  servicesEntityKeywords,
  130,
)

export function ServicesPage() {
  const { t } = useTranslation()
  const requestTourUrl = '/tours?openCustomTour=1#custom-tour-request'

  usePageSeo({
    title: t('services.heroTitle'),
    description: t('services.heroDescription'),
    path: '/services',
    image: '/images/luxury-lodge-aerial-view-0094.jpg',
    imageAlt: 'Uganda safari services and tour operator support',
    preloadImage: '/images/luxury-lodge-aerial-view-0094.jpg',
    keywords: servicesPageKeywordCluster,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('services.heroTitle'),
        description: t('services.heroDescription'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: service.name,
            url:
              typeof window !== 'undefined'
                ? `${window.location.origin}/services/${service.id}`
                : `/services/${service.id}`,
          })),
        },
      },
    ],
  })

  return (
    <>
      <PageHero
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('services.heroActionRequest'), to: requestTourUrl },
          { label: t('services.heroActionSeeTours'), to: '/tours', variant: 'secondary' },
        ]}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            title={t('services.whatWeHandleTitle')}
            subtitle={t('services.whatWeHandleSubtitle')}
          />
          <div className="card-grid services-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ExperienceCallout align="center" />
        </div>
      </section>
    </>
  )
}
