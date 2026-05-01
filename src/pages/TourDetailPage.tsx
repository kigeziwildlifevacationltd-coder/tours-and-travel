import { Link, useParams } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { TourRating } from '../components/TourRating'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { TourRouteMap } from '../components/TourRouteMap'
import { useTranslation } from '../context/useTranslation'
import { tours } from '../data/siteContent'
import { getTourDetail } from '../data/tourDetails'
import { useRuntimeTranslatedList, useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

export function TourDetailPage() {
  const { t } = useTranslation()
  const { tourId } = useParams<{ tourId: string }>()
  const tour = tours.find((item) => item.id === tourId)
  const detail = tour ? getTourDetail(tour) : null
  const translatedTourTitle = useRuntimeTranslatedText(tour?.title ?? '')
  const translatedDetailOverview = useRuntimeTranslatedText(detail?.overview ?? '')
  const translatedItineraryOutline = useRuntimeTranslatedList(detail?.itineraryOutline ?? [])
  const translatedIncludes = useRuntimeTranslatedList(detail?.includes ?? [])
  const translatedPackages = useRuntimeTranslatedList(detail?.packages ?? [])
  const translatedBestFor = useRuntimeTranslatedText(detail?.bestFor ?? '')
  const mapLocation = detail?.mapLocation ?? ''
  const tourEntityKeywords = buildEntityKeywordCluster(
    'tour',
    [tour?.title ?? '', tour?.country ?? '', mapLocation, detail?.bestFor ?? ''],
    24,
  )
  const tourDetailKeywordCluster = buildPageKeywordCluster(
    GORILLA_TREKKING_KEYWORDS,
    UGANDA_SAFARI_KEYWORDS,
    tourEntityKeywords,
    120,
  )

  usePageSeo({
    title: translatedTourTitle || tour?.title || t('tourDetail.notFoundTitle'),
    description: translatedDetailOverview || detail?.overview || t('tourDetail.notFoundDescription'),
    path: tour ? `/tours/${tour.id}` : '/tours',
    image: tour?.image ?? '/images/safari-vehicle-in-grassland-0093.jpg',
    imageAlt: tour?.title ?? 'Uganda safari wildlife and gorilla trekking tour',
    preloadImage: tour?.image,
    noIndex: !tour || !detail,
    keywords: tourDetailKeywordCluster,
    type: 'article',
    structuredData:
      tour && detail
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'TouristTrip',
              name: tour.title,
              description: detail.overview,
              itinerary: detail.itineraryOutline.join(' '),
              touristType: detail.bestFor,
              image: tour.image,
              provider: {
                '@type': 'TravelAgency',
                name: 'Kigezi Wildlife Vacation Safaris',
              },
            },
          ]
        : undefined,
  })

  if (!tour || !detail) {
    return (
      <section className="section not-found">
        <div className="container">
          <h1>{t('tourDetail.notFoundTitle')}</h1>
          <p>{t('tourDetail.notFoundDescription')}</p>
          <Link to="/tours" className="btn btn-primary">
            {t('tourDetail.backToTours')}
          </Link>
        </div>
      </section>
    )
  }

  const prefillCustomTourRequestUrl = `/tours?prefillTourId=${encodeURIComponent(tour.id)}#custom-tour-request`
  const shareExperienceUrl = `/experiences?tour=${encodeURIComponent(tour.id)}#share-experience`
  const routeStops = detail.routeStops.length ? detail.routeStops : [detail.mapLocation]
  const normalizedRouteStops = routeStops
    .map((stop) => stop.trim())
    .filter(Boolean)
    .reduce<string[]>((accumulator, stop) => {
      if (accumulator[accumulator.length - 1] === stop) {
        return accumulator
      }

      accumulator.push(stop)
      return accumulator
    }, [])
  const routeDirectionsUrl = (() => {
    if (normalizedRouteStops.length === 0) {
      return 'https://www.google.com/maps/search/?api=1&query=Uganda'
    }

    if (normalizedRouteStops.length === 1) {
      const params = new URLSearchParams({ api: '1', query: normalizedRouteStops[0] })
      return `https://www.google.com/maps/search/?${params.toString()}`
    }

    const origin = normalizedRouteStops[0]
    const destination = normalizedRouteStops[normalizedRouteStops.length - 1]
    const waypoints = normalizedRouteStops.slice(1, -1)
    const params = new URLSearchParams({
      api: '1',
      origin,
      destination,
      travelmode: 'driving',
    })

    if (waypoints.length) {
      params.set('waypoints', waypoints.join('|'))
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`
  })()
  return (
    <>
      <section className="section">
        <div className="container">
          <SectionHeading title={translatedTourTitle} subtitle={translatedDetailOverview} />
          <div className="service-detail-layout">
            <article className="service-detail-panel">
              <p className="service-detail-label">{t('tourDetail.dayFlowLabel')}</p>
              <h3>{translatedTourTitle}</h3>
              <p className="service-detail-description">{t('tourDetail.sampleBreakdown')}</p>
              <ol className="service-detail-workflow">
                {translatedItineraryOutline.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>

            <aside className="service-detail-panel">
              <p className="service-detail-label">{t('tourDetail.summaryLabel')}</p>
              <h3>{t('tourDetail.whatIncluded')}</h3>
              <ul className="service-detail-highlights">
                {translatedIncludes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {translatedPackages.length ? (
                <>
                  <h4 className="service-detail-subtitle">{t('tourDetail.packagesLabel')}</h4>
                  <ul className="service-detail-list">
                    {translatedPackages.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="service-detail-ideal-for">
                <strong>{t('tourDetail.bestFor')}</strong> {translatedBestFor}
              </p>
              <TourRating tourId={tour.id} className="tour-rating-detail" />
              <div className="service-detail-actions">
                <Link to={prefillCustomTourRequestUrl} className="btn btn-primary">
                  {t('tourDetail.startPlanning')}
                </Link>
              </div>
            </aside>
          </div>

            <article className="service-detail-panel tour-map-panel">
            <p className="service-detail-label">{t('tourDetail.locationLabel')}</p>
            <h3>{t('tourDetail.locationHeading')}</h3>
            <div className="tour-map-meta">
              <p className="service-detail-description">{mapLocation}</p>
              <div className="tour-map-actions">
                <a
                  href={routeDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-compact"
                >
                  {t('destination.viewOnGoogleMaps')}
                </a>
              </div>
            </div>
            <TourRouteMap stops={normalizedRouteStops} />
            {normalizedRouteStops.length > 1 ? (
              <ul className="tour-map-stops" aria-label={t('tourDetail.routeStopsLabel')}>
                {normalizedRouteStops.map((stop) => (
                  <li key={stop}>{stop}</li>
                ))}
              </ul>
            ) : null}
          </article>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ExperienceCallout align="center" shareTo={shareExperienceUrl} />
        </div>
      </section>
    </>
  )
}
