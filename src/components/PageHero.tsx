import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRuntimeTranslatedList, useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import { useTranslation } from '../context/useTranslation'
import { prefetchRoute } from '../utils/routePrefetch'

type HeroAction = {
  label: string
  to: string
  variant?: 'primary' | 'secondary' | 'accent'
}

type HeroPanel = {
  title: string
  points: string[]
}

type PageHeroProps = {
  eyebrow?: string
  title?: string
  description?: string
  actions?: HeroAction[]
  highlights?: string[]
  panel?: HeroPanel
  backgroundImages?: string[]
  backgroundIntervalMs?: number
  showScrollCue?: boolean
  scrollCueTargetId?: string
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  highlights,
  panel,
  backgroundImages,
  backgroundIntervalMs = 6000,
  showScrollCue = false,
  scrollCueTargetId,
  className,
}: PageHeroProps) {
  const { t } = useTranslation()
  const heroBackgrounds = useMemo(() => backgroundImages?.filter(Boolean) ?? [], [backgroundImages])
  const translatedEyebrow = useRuntimeTranslatedText(eyebrow ?? '')
  const translatedTitle = useRuntimeTranslatedText(title ?? '')
  const translatedDescription = useRuntimeTranslatedText(description ?? '')
  const actionLabelSeeds = useMemo(() => actions?.map((action) => action.label) ?? [], [actions])
  const translatedActionLabels = useRuntimeTranslatedList(actionLabelSeeds)
  const translatedHighlights = useRuntimeTranslatedList(highlights ?? [])
  const panelPointSeeds = useMemo(() => panel?.points ?? [], [panel])
  const translatedPanelPoints = useRuntimeTranslatedList(panelPointSeeds)
  const translatedPanelTitle = useRuntimeTranslatedText(panel?.title ?? '')
  const hasEyebrow = Boolean(eyebrow)
  const hasTitle = Boolean(title)
  const hasDescription = Boolean(description)
  const contentAnchorId = 'page-content'
  const [activeBackgroundIndex, setActiveBackgroundIndex] = useState(0)
  const [loadedBackgroundIndexes, setLoadedBackgroundIndexes] = useState<Set<number>>(
    () => new Set([0]),
  )
  const safeActiveBackgroundIndex = heroBackgrounds.length
    ? activeBackgroundIndex % heroBackgrounds.length
    : 0
  const loadedBackgroundIndexesRef = useRef(loadedBackgroundIndexes)
  const scrollCueHref = scrollCueTargetId ? `#${scrollCueTargetId}` : '#main-content'

  const markBackgroundAsLoaded = useCallback((index: number) => {
    setLoadedBackgroundIndexes((current) => {
      if (current.has(index)) {
        return current
      }

      const next = new Set(current)
      next.add(index)
      return next
    })
  }, [])

  useEffect(() => {
    loadedBackgroundIndexesRef.current = loadedBackgroundIndexes
  }, [loadedBackgroundIndexes])

  useEffect(() => {
    if (heroBackgrounds.length < 2) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveBackgroundIndex((current) => {
        const nextIndex = (current + 1) % heroBackgrounds.length
        return loadedBackgroundIndexesRef.current.has(nextIndex) ? nextIndex : current
      })
    }, backgroundIntervalMs)

    return () => window.clearInterval(intervalId)
  }, [heroBackgrounds, backgroundIntervalMs])

  useEffect(() => {
    if (heroBackgrounds.length < 2) {
      return
    }

    const nextBackgroundIndex = (safeActiveBackgroundIndex + 1) % heroBackgrounds.length
    const nextImage = new Image()
    nextImage.decoding = 'async'
    nextImage.onload = () => {
      markBackgroundAsLoaded(nextBackgroundIndex)
    }
    nextImage.src = heroBackgrounds[nextBackgroundIndex]
  }, [heroBackgrounds, markBackgroundAsLoaded, safeActiveBackgroundIndex])

  return (
    <>
      <section
        className={[
          'page-hero',
          heroBackgrounds.length ? 'with-background' : '',
          showScrollCue ? 'with-scroll-cue' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {heroBackgrounds.length ? (
          <div className="hero-background" aria-hidden="true">
            {heroBackgrounds.map((backgroundImage, index) => (
              <img
                key={`${backgroundImage}-${index}`}
                className={`hero-background-image ${
                  index === safeActiveBackgroundIndex && loadedBackgroundIndexes.has(index)
                    ? 'active'
                    : ''
                }`}
                src={backgroundImage}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'low'}
                onLoad={() => markBackgroundAsLoaded(index)}
              />
            ))}
          </div>
        ) : null}
        <div className="container hero-grid">
          <div className="hero-copy">
            {hasEyebrow ? <p className="eyebrow">{translatedEyebrow}</p> : null}
            {hasTitle ? <h1>{translatedTitle}</h1> : null}
            {hasDescription ? <p className="hero-description">{translatedDescription}</p> : null}
            {actions?.length ? (
              <div className="hero-actions">
                {actions.map((action, index) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className={`btn ${
                      action.variant === 'secondary'
                        ? 'btn-secondary'
                        : action.variant === 'accent'
                          ? 'btn-accent'
                          : 'btn-primary'
                    }`}
                    onMouseEnter={() => prefetchRoute(action.to)}
                    onFocus={() => prefetchRoute(action.to)}
                  >
                    {translatedActionLabels[index] ?? action.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {translatedHighlights.length ? (
              <ul className="hero-highlights">
                {translatedHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {panel ? (
            <aside className="hero-panel" aria-label={translatedPanelTitle}>
              <p className="hero-panel-title">{translatedPanelTitle}</p>
              <ul className="hero-panel-list">
                {translatedPanelPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
        {showScrollCue ? (
          <a className="hero-scroll-cue" href={scrollCueHref} aria-label={t('a11y.scrollForMore')}>
            <span>{t('hero.scroll')}</span>
            <span className="hero-scroll-arrow" aria-hidden="true" />
          </a>
        ) : null}
      </section>
      <span id={contentAnchorId} className="hero-content-anchor" aria-hidden="true" />
    </>
  )
}
