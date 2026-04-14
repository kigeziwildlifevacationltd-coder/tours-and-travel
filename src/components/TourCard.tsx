import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from '../context/useTranslation'
import { useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import type { Tour } from '../types/content'
import { prefetchRoute } from '../utils/routePrefetch'
import { TourRating } from './TourRating'

type TourCardProps = {
  tour: Tour
}

export function TourCard({ tour }: TourCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const detailPath = `/tours/${tour.id}`
  const translatedDuration = useRuntimeTranslatedText(tour.duration)
  const translatedCountry = useRuntimeTranslatedText(tour.country)
  const translatedTitle = useRuntimeTranslatedText(tour.title)
  const translatedSummary = useRuntimeTranslatedText(tour.summary)
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement

    if (target.closest('a, button, input, textarea, select')) {
      return
    }

    navigate(detailPath)
  }

  return (
    <article
      id={tour.id}
      className={`tour-card ${tour.featured ? 'featured' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => prefetchRoute(detailPath)}
    >
      <div className="card-media">
        {tour.featured ? <span className="tour-badge">{t('tour.featured')}</span> : null}
        <img
          src={tour.image}
          alt={translatedTitle}
          loading="lazy"
          decoding="async"
          fetchPriority={tour.featured ? 'high' : 'low'}
          width={640}
          height={400}
        />
      </div>
      <div className="tour-card-body">
        <div className="tour-meta">
          <span>{translatedDuration}</span>
          <span>{translatedCountry}</span>
        </div>
        <h3>{translatedTitle}</h3>
        <p>{translatedSummary}</p>
        <TourRating tourId={tour.id} />
        <Link
          to={detailPath}
          className="card-cta card-cta-link"
          onFocus={() => prefetchRoute(detailPath)}
        >
          {t('tour.viewItineraryDetails')}
        </Link>
      </div>
    </article>
  )
}
