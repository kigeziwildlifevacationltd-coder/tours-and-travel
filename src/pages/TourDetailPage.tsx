import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { TourRating } from '../components/TourRating'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { TourRouteMap } from '../components/TourRouteMap'
import { TourBrochure } from '../components/TourBrochure'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { tours } from '../data/siteContent'
import { getTourDetail, type TourItineraryDay } from '../data/tourDetails'
import { useRuntimeTranslatedList, useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

type TourItineraryDayPanelProps = {
  day: TourItineraryDay
  defaultOpen?: boolean
}

function TourItineraryDayPanel({ day, defaultOpen = false }: TourItineraryDayPanelProps) {
  const { t } = useTranslation()
  const translatedDayLabel = useRuntimeTranslatedText(day.dayLabel)
  const translatedHeadline = useRuntimeTranslatedText(day.headline)
  const translatedDetails = useRuntimeTranslatedList(day.details)
  const translatedHighlights = useRuntimeTranslatedList(day.highlights)
  const translatedBaseLocation = useRuntimeTranslatedText(day.baseLocation)
  const translatedOvernightLocation = useRuntimeTranslatedText(day.overnightLocation)

  return (
    <details className="tour-itinerary-day" open={defaultOpen}>
      <summary className="tour-itinerary-summary">
        <span className="tour-itinerary-day-badge">{translatedDayLabel}</span>
        <span className="tour-itinerary-summary-copy">
          <span className="tour-itinerary-summary-title">{translatedHeadline}</span>
          {translatedHighlights.length ? (
            <span className="tour-itinerary-summary-tags" aria-hidden="true">
              {translatedHighlights.slice(0, 2).join(' / ')}
            </span>
          ) : null}
        </span>
        <span className="tour-itinerary-summary-icon" aria-hidden="true" />
      </summary>
      <div className="tour-itinerary-body">
        <div className="tour-itinerary-meta">
          {translatedBaseLocation ? (
            <span className="tour-itinerary-meta-item">
              <strong>{t('tourDetail.baseLabel')}</strong> {translatedBaseLocation}
            </span>
          ) : null}
          {translatedOvernightLocation ? (
            <span className="tour-itinerary-meta-item">
              <strong>{t('tourDetail.overnightLabel')}</strong> {translatedOvernightLocation}
            </span>
          ) : null}
        </div>

        {translatedHighlights.length ? (
          <ul className="tour-itinerary-highlights">
            {translatedHighlights.map((item) => (
              <li key={`${day.id}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : null}

        <ul className="tour-itinerary-details">
          {translatedDetails.map((item) => (
            <li key={`${day.id}-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
    </details>
  )
}

export function TourDetailPage() {
  const { t } = useTranslation()
  const { tourId } = useParams<{ tourId: string }>()
  const tour = tours.find((item) => item.id === tourId)
  const detail = tour ? getTourDetail(tour) : null
  const translatedTourTitle = useRuntimeTranslatedText(tour?.title ?? '')
  const translatedDetailOverview = useRuntimeTranslatedText(detail?.overview ?? '')
  const translatedIncludes = useRuntimeTranslatedList(detail?.includes ?? [])
  const translatedQuotation = useRuntimeTranslatedList(detail?.quotation ?? [])
  const translatedExcludes = useRuntimeTranslatedList(detail?.excludes ?? [])
  const translatedPackages = useRuntimeTranslatedList(detail?.packages ?? [])
  const translatedPlanningNotes = useRuntimeTranslatedList(detail?.planningNotes ?? [])
  const translatedBestFor = useRuntimeTranslatedText(detail?.bestFor ?? '')
  const translatedSnapshotValues = useRuntimeTranslatedList(
    detail
      ? [
          detail.snapshot.startEnd,
          detail.snapshot.routeStyle,
          detail.snapshot.pace,
          detail.snapshot.mainFocus,
          detail.snapshot.mainRoute,
          detail.snapshot.permitPlanning,
        ]
      : [],
  )
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
              url: `/tours/${tour.id}`,
              mainEntityOfPage: `/tours/${tour.id}`,
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
  const snapshotItems = [
    {
      label: t('tourDetail.snapshotStartEnd'),
      value: translatedSnapshotValues[0] ?? detail.snapshot.startEnd,
    },
    {
      label: t('tourDetail.snapshotRouteStyle'),
      value: translatedSnapshotValues[1] ?? detail.snapshot.routeStyle,
    },
    {
      label: t('tourDetail.snapshotPace'),
      value: translatedSnapshotValues[2] ?? detail.snapshot.pace,
    },
    {
      label: t('tourDetail.snapshotMainFocus'),
      value: translatedSnapshotValues[3] ?? detail.snapshot.mainFocus,
    },
    {
      label: t('tourDetail.snapshotMainRoute'),
      value: translatedSnapshotValues[4] ?? detail.snapshot.mainRoute,
    },
    {
      label: t('tourDetail.snapshotPermitPlanning'),
      value: translatedSnapshotValues[5] ?? detail.snapshot.permitPlanning,
    },
  ]
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
      <PageHero
        title={tour.title}
        className="hero-actions-centered tour-detail-hero"
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container">
          <div className="service-detail-layout">
            <article className="service-detail-panel">
              <p className="service-detail-label">{t('tourDetail.dayFlowLabel')}</p>
              <h3>{translatedTourTitle}</h3>
              <p className="service-detail-description">{t('tourDetail.dayDropdownHint')}</p>
              <div className="tour-itinerary-accordion">
                {detail.itineraryDays.map((day, index) => (
                  <TourItineraryDayPanel key={day.id} day={day} defaultOpen={index === 0} />
                ))}
              </div>
            </article>

            <aside className="service-detail-panel">
              <p className="service-detail-label">{t('tourDetail.summaryLabel')}</p>
              <h3>{t('tourDetail.snapshotTitle')}</h3>
              <div className="tour-snapshot-grid">
                {snapshotItems.map((item) => (
                  <div key={item.label} className="tour-snapshot-card">
                    <p className="tour-snapshot-label">{item.label}</p>
                    <p className="tour-snapshot-value">{item.value}</p>
                  </div>
                ))}
              </div>

              {translatedPlanningNotes.length ? (
                <>
                  <h4 className="service-detail-subtitle">{t('tourDetail.notesTitle')}</h4>
                  <ul className="service-detail-list">
                    {translatedPlanningNotes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {translatedQuotation.length ? (
                <>
                  <h4 className="service-detail-subtitle">{t('tourDetail.quotationLabel')}</h4>
                  <ul className="service-detail-list">
                    {translatedQuotation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              <h4 className="service-detail-subtitle">{t('tourDetail.whatIncluded')}</h4>
              <ul className="service-detail-highlights">
                {translatedIncludes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {translatedExcludes.length ? (
                <>
                  <h4 className="service-detail-subtitle">{t('tourDetail.excludesLabel')}</h4>
                  <ul className="service-detail-list">
                    {translatedExcludes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
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

          <TourBrochure tour={tour} detail={detail} />

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
