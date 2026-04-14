import type { Destination } from '../types/content'
import { useTranslation } from '../context/useTranslation'
import { useRuntimeTranslatedList, useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'

type DestinationCardProps = {
  destination: Destination
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const { t } = useTranslation()
  const translatedRegion = useRuntimeTranslatedText(destination.region)
  const translatedName = useRuntimeTranslatedText(destination.name)
  const translatedSummary = useRuntimeTranslatedText(destination.summary)
  const translatedHighlights = useRuntimeTranslatedList(destination.highlights)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${destination.name}, Uganda`,
  )}`

  return (
    <article id={destination.id} className="destination-card">
      <div className="destination-media">
        <img
          src={destination.image}
          alt={translatedName}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={640}
          height={400}
        />
      </div>
      <div className="destination-body">
        <p className="destination-region">{translatedRegion}</p>
        <h3>{translatedName}</h3>
        <p>{translatedSummary}</p>
        <ul className="destination-highlights">
          {translatedHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <a className="card-cta card-cta-link" href={mapUrl} target="_blank" rel="noreferrer">
          {t('destination.viewOnGoogleMaps')}
        </a>
      </div>
    </article>
  )
}
