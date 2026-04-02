import { DestinationCard } from '../components/DestinationCard'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { destinations } from '../data/siteContent'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

const destinationEntityKeywords = buildEntityKeywordCluster(
  'destination',
  destinations.map((destination) => destination.name),
  48,
)
const destinationsPageKeywordCluster = buildPageKeywordCluster(
  UGANDA_SAFARI_KEYWORDS,
  GORILLA_TREKKING_KEYWORDS,
  destinationEntityKeywords,
  140,
)

export function DestinationsPage() {
  const { t } = useTranslation()

  usePageSeo({
    title: t('destinations.heroTitle'),
    description: t('destinations.heroDescription'),
    path: '/destinations',
    image: '/images/lake-islands-overlook-0031.jpg',
    imageAlt: 'Uganda safari destinations and wildlife travel routes',
    preloadImage: '/images/lake-islands-overlook-0031.jpg',
    keywords: destinationsPageKeywordCluster,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('destinations.heroTitle'),
      description: t('destinations.heroDescription'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: destinations.map((destination, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: destination.name,
          description: destination.summary,
        })),
      },
    },
  })

  return (
    <>
      <PageHero
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('destinations.heroActionBrowseTours'), to: '/tours' },
          { label: t('destinations.heroActionCustomizeTour'), to: '/tours', variant: 'secondary' },
        ]}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            title={`${destinations.length} ${t('destinations.countSuffix')}`}
            subtitle={t('destinations.subtitle')}
          />
          <div className="card-grid destinations-grid">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
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
