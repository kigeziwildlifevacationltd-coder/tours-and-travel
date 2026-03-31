import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../context/useTranslation'
import { useTourRating } from '../hooks/useTourRating'

type TourRatingProps = {
  tourId: string
  className?: string
}

const ratingValues = [1, 2, 3, 4, 5] as const

export function TourRating({ tourId, className }: TourRatingProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    userRating,
    averageRating,
    isSubmitting,
    canRate,
    setTourRating,
  } = useTourRating(tourId)
  const rootClassName = useMemo(
    () => ['tour-rating', className].filter(Boolean).join(' '),
    [className],
  )
  const isBusy = isSubmitting
  const displayRating = userRating > 0 ? userRating : Math.round(averageRating)
  const handleStarClick = (value: number) => {
    if (!canRate) {
      const searchParams = new URLSearchParams({
        tour: tourId,
        rating: String(value),
      })
      navigate(`/experiences?${searchParams.toString()}#experience-auth`)
      return
    }

    setTourRating(value)
  }

  return (
    <section className={rootClassName} aria-label={t('tour.ratingLabel')} data-busy={isBusy}>
      <div
        className="tour-rating-stars"
        role="radiogroup"
        aria-label={t('tour.ratingLabel')}
        aria-busy={isBusy}
      >
        {ratingValues.map((value) => {
          const isFilled = value <= displayRating

          return (
            <button
              key={value}
              type="button"
              className={`tour-rating-star ${isFilled ? 'is-filled' : ''}`}
              onClick={() => handleStarClick(value)}
              aria-label={`${t('tour.ratingButtonLabelPrefix')} ${value}/5`}
              aria-pressed={value === userRating}
              aria-disabled={!canRate || isSubmitting}
              disabled={isSubmitting}
            >
              <span aria-hidden="true">{'\u2605'}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
