import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { services } from '../data/siteContent'
import { getServiceDetail } from '../data/serviceDetails'
import { useRuntimeTranslatedList, useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

export function ServiceDetailPage() {
  const { t } = useTranslation()
  const requestTourUrl = '/tours?openCustomTour=1#custom-tour-request'
  const { serviceId } = useParams<{ serviceId: string }>()
  const service = services.find((item) => item.id === serviceId)
  const detail = service ? getServiceDetail(service) : null
  const translatedServiceName = useRuntimeTranslatedText(service?.name ?? '')
  const translatedDetailDescription = useRuntimeTranslatedText(detail?.fullDescription ?? '')
  const translatedTypicalTimeline = useRuntimeTranslatedText(detail?.typicalTimeline ?? '')
  const translatedDeliverables = useRuntimeTranslatedList(detail?.deliverables ?? [])
  const translatedServiceNotes = useRuntimeTranslatedList(detail?.serviceNotes ?? [])
  const translatedWorkflow = useRuntimeTranslatedList(detail?.howItWorks ?? [])
  const translatedTravelerInputs = useRuntimeTranslatedList(detail?.travelerInputs ?? [])
  const translatedIdealFor = useRuntimeTranslatedText(detail?.idealFor ?? '')
  const serviceEntityKeywords = buildEntityKeywordCluster(
    'service',
    [service?.name ?? '', detail?.idealFor ?? '', detail?.typicalTimeline ?? ''],
    24,
  )
  const serviceDetailKeywordCluster = buildPageKeywordCluster(
    UGANDA_SAFARI_KEYWORDS,
    GORILLA_TREKKING_KEYWORDS,
    serviceEntityKeywords,
    120,
  )

  usePageSeo({
    title: translatedServiceName || service?.name || t('serviceDetail.notFoundTitle'),
    description:
      translatedDetailDescription || detail?.fullDescription || t('serviceDetail.notFoundDescription'),
    path: service ? `/services/${service.id}` : '/services',
    image: service?.image ?? '/images/luxury-lodge-aerial-view-0094.jpg',
    imageAlt: service?.name ?? 'Uganda safari service support',
    preloadImage: service?.image,
    noIndex: !service || !detail,
    keywords: serviceDetailKeywordCluster,
    type: 'article',
    structuredData:
      service && detail
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: service.name,
              description: detail.fullDescription,
              provider: {
                '@type': 'TravelAgency',
                name: 'Kigezi Wildlife Vacation Safaris',
              },
              serviceType: service.name,
            },
          ]
        : undefined,
  })

  if (!service || !detail) {
    return (
      <section className="section not-found">
        <div className="container">
          <h1>{t('serviceDetail.notFoundTitle')}</h1>
          <p>{t('serviceDetail.notFoundDescription')}</p>
          <Link to="/services" className="btn btn-primary">
            {t('serviceDetail.backToServices')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <PageHero
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('serviceDetail.heroActionRequest'), to: requestTourUrl },
          { label: t('serviceDetail.heroActionAllServices'), to: '/services', variant: 'secondary' },
        ]}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container service-detail-layout">
          <article className="service-detail-panel">
            <p className="service-detail-label">{t('serviceDetail.scopeLabel')}</p>
            <h3>{t('serviceDetail.whatYouReceive')}</h3>
            <p className="service-detail-meta">
              <strong>{t('serviceDetail.typicalTimeline')}</strong> {translatedTypicalTimeline}
            </p>
            <h4 className="service-detail-subtitle">{t('serviceDetail.keyDeliverables')}</h4>
            <ul className="service-detail-highlights">
              {translatedDeliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h4 className="service-detail-subtitle">{t('serviceDetail.importantNotes')}</h4>
            <ul className="service-detail-list">
              {translatedServiceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>

          <aside className="service-detail-panel">
            <p className="service-detail-label">{t('serviceDetail.processLabel')}</p>
            <h3>{t('serviceDetail.howItWorks')}</h3>
            <ol className="service-detail-workflow">
              {translatedWorkflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <h4 className="service-detail-subtitle">{t('serviceDetail.weNeedFromYou')}</h4>
            <ul className="service-detail-list">
              {translatedTravelerInputs.map((input) => (
                <li key={input}>{input}</li>
              ))}
            </ul>

            <p className="service-detail-ideal-for">
              <strong>{t('serviceDetail.bestFor')}</strong> {translatedIdealFor}
            </p>
            <div className="service-detail-actions">
              <Link to={requestTourUrl} className="btn btn-primary">
                {t('serviceDetail.talkToTeam')}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
