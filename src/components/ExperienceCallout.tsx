import { Link } from 'react-router-dom'
import { SectionHeading } from './SectionHeading'
import { useTranslation } from '../context/useTranslation'

type ExperienceCalloutProps = {
  className?: string
  align?: 'left' | 'center'
  shareTo?: string
  feedTo?: string
  showHighlights?: boolean
}

export function ExperienceCallout({
  className,
  align = 'left',
  shareTo = '/experiences#share-experience',
  feedTo = '/experiences#experience-feed',
  showHighlights = true,
}: ExperienceCalloutProps) {
  const { t } = useTranslation()

  return (
    <article
      className={[
        'content-card',
        'experience-callout',
        align === 'center' ? 'experience-callout-centered' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="experience-callout-body">
        <SectionHeading title={t('experiences.heroTitle')} subtitle={t('experiences.heroDescription')} />
        {showHighlights ? (
          <div className="experience-callout-highlights" aria-label={t('experiences.heroEyebrow')}>
            <span>{t('experiences.heroHighlight1')}</span>
            <span>{t('experiences.heroHighlight2')}</span>
            <span>{t('experiences.heroHighlight3')}</span>
          </div>
        ) : null}
      </div>
      <div className="experience-callout-actions">
        <Link to={shareTo} className="btn btn-primary">
          {t('experiences.heroActionSecondary')}
        </Link>
        <Link to={feedTo} className="btn btn-secondary">
          {t('nav.experiences')}
        </Link>
      </div>
    </article>
  )
}
