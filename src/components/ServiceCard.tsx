import { Link } from 'react-router-dom'
import { useTranslation } from '../context/useTranslation'
import { useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import type { Service } from '../types/content'
import { prefetchRoute } from '../utils/routePrefetch'

type ServiceCardProps = {
  service: Service
}

const FALLBACK_SERVICE_IMAGE =
  'https://placehold.co/640x426?text=Service+Image'

export function ServiceCard({ service }: ServiceCardProps) {
  const { t } = useTranslation()
  const translatedName = useRuntimeTranslatedText(service.name)
  const translatedDescription = useRuntimeTranslatedText(service.description)

  return (
    <article id={service.id} className="service-card">
      <Link
        to={`/services/${service.id}`}
        className="service-card-link"
        aria-label={`${t('service.viewDetailsFor')} ${translatedName}`}
        onMouseEnter={() => prefetchRoute(`/services/${service.id}`)}
        onFocus={() => prefetchRoute(`/services/${service.id}`)}
      >
        <div className="card-media service-media">
          <img
            src={service.image}
            alt={translatedName}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={640}
            height={480}
            referrerPolicy="no-referrer"
            onError={(event) => {
              const image = event.currentTarget

              if (image.dataset.fallbackApplied === 'true') {
                return
              }

              image.dataset.fallbackApplied = 'true'
              image.src = FALLBACK_SERVICE_IMAGE
            }}
          />
        </div>
        <div className="service-card-body">
          <h3>{translatedName}</h3>
          <p>{translatedDescription}</p>
          <p className="card-cta">{t('service.viewFullDetails')}</p>
        </div>
      </Link>
    </article>
  )
}
