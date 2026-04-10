import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { TourCard } from '../components/TourCard'
import { ExperienceCallout } from '../components/ExperienceCallout'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { tours } from '../data/siteContent'
import { getTourDetail } from '../data/tourDetails'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'
import { sendEmailWithApi } from '../utils/emailApi'
import {
  BUSINESS_CONTACT_EMAIL,
  buildEmailBody,
  toEmailValue,
} from '../utils/emailDraft'

const CUSTOM_TOUR_FORM_ANCHOR = 'custom-tour-request'
const CUSTOM_TOUR_MODAL_DESCRIPTION_ID = 'custom-tour-modal-description'
const PREFILL_TOUR_ID_QUERY_PARAM = 'prefillTourId'
const OPEN_CUSTOM_TOUR_QUERY_PARAM = 'openCustomTour'
const toursEntityKeywords = buildEntityKeywordCluster(
  'tour',
  tours.map((tour) => tour.title),
  36,
)
const toursPageKeywordCluster = buildPageKeywordCluster(
  UGANDA_SAFARI_KEYWORDS,
  GORILLA_TREKKING_KEYWORDS,
  toursEntityKeywords,
  140,
)

const toursSeoFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you offer private and group Uganda safari tours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. We plan private Uganda safari tours, small group safari tours, and fully custom safari packages based on your budget and travel goals.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you build a custom Uganda safari itinerary?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. We provide Uganda safari itinerary planning for wildlife tours, gorilla trekking trips, family holidays, honeymoon tours, and adventure travel.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I request online safari booking assistance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. You can submit your request online and our team will help with Uganda safari booking, permit planning, and complete holiday package setup.',
      },
    },
  ],
}

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  title: '',
  durationDays: '',
  destination: '',
  interests: '',
  travelStyle: 'Private',
  groupSize: '',
  budget: '',
  notes: '',
}

function parseDurationDays(duration: string): string {
  const match = duration.match(/\d+/)
  return match?.[0] ?? ''
}

function buildPrefilledFormState(prefillTourId: string | null) {
  if (!prefillTourId) {
    return null
  }

  const selectedTour = tours.find((tour) => tour.id === prefillTourId)

  if (!selectedTour) {
    return null
  }

  const detail = getTourDetail(selectedTour)

  return {
    ...initialFormState,
    title: selectedTour.title,
    durationDays: parseDurationDays(selectedTour.duration),
    destination: detail.mapLocation || selectedTour.country,
    interests: detail.highlights.slice(0, 3).join(', '),
  }
}

export function ToursPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [prefilledTourName, setPrefilledTourName] = useState<string | null>(null)
  const [isRequestNoticeVisible, setIsRequestNoticeVisible] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [submitRequestError, setSubmitRequestError] = useState<string | null>(null)
  const customFormOpenButtonRef = useRef<HTMLButtonElement | null>(null)
  const customTourModalRef = useRef<HTMLElement | null>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)

  usePageSeo({
    title: t('tours.heroTitle'),
    description: t('tours.heroDescription'),
    path: '/tours',
    image: '/images/safari-vehicle-in-grassland-0093.jpg',
    imageAlt: 'Uganda safari tour packages and gorilla trekking itineraries',
    preloadImage: '/images/safari-vehicle-in-grassland-0093.jpg',
    keywords: toursPageKeywordCluster,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('tours.heroTitle'),
        description: t('tours.heroDescription'),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: tours.map((tour, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tour.title,
            url: `/tours/${tour.id}`,
          })),
        },
      },
      toursSeoFaqSchema,
    ],
  })

  const clearCustomTourHash = useCallback(() => {
    const currentUrl = new URL(window.location.href)

    if (
      currentUrl.hash !== `#${CUSTOM_TOUR_FORM_ANCHOR}` &&
      !currentUrl.searchParams.has(PREFILL_TOUR_ID_QUERY_PARAM) &&
      !currentUrl.searchParams.has(OPEN_CUSTOM_TOUR_QUERY_PARAM)
    ) {
      return
    }

    currentUrl.hash = ''
    currentUrl.searchParams.delete(PREFILL_TOUR_ID_QUERY_PARAM)
    currentUrl.searchParams.delete(OPEN_CUSTOM_TOUR_QUERY_PARAM)
    const nextRelativeUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
    window.history.replaceState(null, '', nextRelativeUrl)
  }, [])

  const closeCustomTourForm = useCallback(() => {
    setIsCustomFormOpen(false)
    clearCustomTourHash()
    if (prefilledTourName) {
      setFormData(initialFormState)
      setPrefilledTourName(null)
    }
    window.setTimeout(() => {
      const nextFocusTarget = lastFocusedElementRef.current ?? customFormOpenButtonRef.current
      nextFocusTarget?.focus()
      lastFocusedElementRef.current = null
    }, 0)
  }, [clearCustomTourHash, prefilledTourName])

  const openCustomTourForm = useCallback(() => {
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIsCustomFormOpen(true)
    setIsRequestNoticeVisible(false)
    setSubmitRequestError(null)
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const shouldOpenFromHash = location.hash === `#${CUSTOM_TOUR_FORM_ANCHOR}`
    const shouldOpenFromQuery = searchParams.get(OPEN_CUSTOM_TOUR_QUERY_PARAM) === '1'

    if (!shouldOpenFromHash && !shouldOpenFromQuery) {
      return
    }

    const prefillTourId = searchParams.get(PREFILL_TOUR_ID_QUERY_PARAM)
    const prefilledFormState = buildPrefilledFormState(prefillTourId)

    const timerId = window.setTimeout(() => {
      if (prefilledFormState) {
        setFormData(prefilledFormState)
        setPrefilledTourName(prefilledFormState.title)
      } else {
        setFormData(initialFormState)
        setPrefilledTourName(null)
      }
      openCustomTourForm()
      document.getElementById(CUSTOM_TOUR_FORM_ANCHOR)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [location.hash, location.search, openCustomTourForm])

  useEffect(() => {
    if (!isCustomFormOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCustomFormOpen])

  useEffect(() => {
    if (!isCustomFormOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCustomTourForm()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isCustomFormOpen, closeCustomTourForm])

  useEffect(() => {
    if (!isCustomFormOpen) {
      return
    }

    const modal = customTourModalRef.current

    if (!modal) {
      return
    }

    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const getFocusableElements = () =>
      Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.getAttribute('aria-hidden') !== 'true',
      )

    const initialFocusableElement = getFocusableElements()[0]
    initialFocusableElement?.focus()

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements()

      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (!activeElement || activeElement === firstElement || !modal.contains(activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }

        return
      }

      if (activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleFocusTrap)

    return () => {
      window.removeEventListener('keydown', handleFocusTrap)
    }
  }, [isCustomFormOpen])

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleCustomTourSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitRequestError(null)

    const notProvided = t('tours.email.notProvided')
    const submittedAt = new Date().toLocaleString()
    const getTravelStyleLabel = (value: string) => {
      if (value === 'Group') {
        return t('tours.form.styleGroup')
      }

      if (value === 'Luxury') {
        return t('tours.form.styleLuxury')
      }

      if (value === 'Mid-range') {
        return t('tours.form.styleMidRange')
      }

      if (value === 'Budget') {
        return t('tours.form.styleBudget')
      }

      return t('tours.form.stylePrivate')
    }
    const body = buildEmailBody({
      title: t('tours.email.heading'),
      intro: `${t('tours.email.lineGreeting')}\n${t('tours.email.lineRequest')}`,
      sections: [
        {
          title: t('tours.email.sectionTraveler'),
          fields: [
            { label: t('tours.email.fieldFullName'), value: toEmailValue(formData.fullName, notProvided) },
            { label: t('tours.email.fieldEmail'), value: toEmailValue(formData.email, notProvided) },
            { label: t('tours.email.fieldPhone'), value: toEmailValue(formData.phone, notProvided) },
          ],
        },
        {
          title: t('tours.email.sectionTrip'),
          fields: [
            { label: t('tours.email.fieldTourName'), value: toEmailValue(formData.title, notProvided) },
            { label: t('tours.email.fieldDuration'), value: toEmailValue(formData.durationDays, notProvided) },
            {
              label: t('tours.email.fieldDestination'),
              value: toEmailValue(formData.destination, notProvided),
            },
            { label: t('tours.email.fieldInterests'), value: toEmailValue(formData.interests, notProvided) },
          ],
        },
        {
          title: t('tours.email.sectionPreferences'),
          fields: [
            {
              label: t('tours.email.fieldTravelStyle'),
              value: getTravelStyleLabel(formData.travelStyle),
            },
            { label: t('tours.email.fieldGroupSize'), value: toEmailValue(formData.groupSize, notProvided) },
            { label: t('tours.email.fieldBudget'), value: toEmailValue(formData.budget, notProvided) },
          ],
        },
        {
          title: t('tours.email.sectionNotes'),
          fields: [
            {
              label: t('tours.email.additionalNotes'),
              value: toEmailValue(formData.notes, t('tours.email.noAdditionalNotes')),
            },
          ],
        },
      ],
      footerLines: [`${t('tours.email.generatedAt')}: ${submittedAt}`, t('tours.email.lineFollowUp')],
    })
    const subject = `${t('tours.email.subjectPrefix')}${formData.destination || t('tours.email.subjectFallbackDestination')}`
    const senderName = toEmailValue(formData.fullName, 'Website Visitor')
    const senderEmail = toEmailValue(formData.email, BUSINESS_CONTACT_EMAIL)

    setIsSubmittingRequest(true)

    try {
      await sendEmailWithApi({
        subject,
        body,
        fromName: senderName,
        fromEmail: senderEmail,
        source: 'custom-tour',
        submittedAt,
        phone: toEmailValue(formData.phone, notProvided),
        tourName: toEmailValue(formData.title, notProvided),
        durationDays: toEmailValue(formData.durationDays, notProvided),
        destination: toEmailValue(formData.destination, notProvided),
        interests: toEmailValue(formData.interests, notProvided),
        travelStyle: getTravelStyleLabel(formData.travelStyle),
        groupSize: toEmailValue(formData.groupSize, notProvided),
        budget: toEmailValue(formData.budget, notProvided),
        additionalDetails: toEmailValue(formData.notes, t('tours.email.noAdditionalNotes')),
      })
      setFormData(initialFormState)
      setIsRequestNoticeVisible(true)
      closeCustomTourForm()
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : t('tours.form.error')
      setSubmitRequestError(message)
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  return (
    <>
      <PageHero
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('tours.heroActionStartPlanning'), to: `/tours#${CUSTOM_TOUR_FORM_ANCHOR}` },
          { label: t('tours.heroActionViewServices'), to: '/services', variant: 'secondary' },
        ]}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container">
          <article id={CUSTOM_TOUR_FORM_ANCHOR} className="service-detail-panel custom-tour-panel">
            <div className="custom-tour-head">
              <div>
                <p className="service-detail-label">{t('tours.customPlanLabel')}</p>
                <h3>{t('tours.customRequestTitle')}</h3>
                <p className="service-detail-description">{t('tours.customRequestDescription')}</p>
              </div>
              <button
                ref={customFormOpenButtonRef}
                type="button"
                className="btn btn-secondary"
                onClick={openCustomTourForm}
              >
                {t('tours.customFormOpen')}
              </button>
            </div>

            {isRequestNoticeVisible ? (
              <p className="form-success">{t('tours.form.notice')}</p>
            ) : null}
          </article>

          <SectionHeading
            title={`${tours.length} ${t('tours.availableToursSuffix')}`}
            subtitle={t('tours.availableToursSubtitle')}
          />
          <div className="card-grid tours-grid">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ExperienceCallout align="center" />
        </div>
      </section>

      {isCustomFormOpen ? (
        <div className="custom-tour-modal-backdrop" onClick={closeCustomTourForm} role="presentation">
          <article
            ref={customTourModalRef}
            className="custom-tour-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-tour-modal-title"
            aria-describedby={CUSTOM_TOUR_MODAL_DESCRIPTION_ID}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="custom-tour-modal-header">
              <p className="service-detail-label">{t('tours.customPlanLabel')}</p>
              <button
                type="button"
                className="custom-tour-modal-close"
                onClick={closeCustomTourForm}
                aria-label={t('tours.customFormClose')}
              >
                {t('tours.customFormClose')}
              </button>
            </div>
            <h3 id="custom-tour-modal-title">{t('tours.customRequestTitle')}</h3>
            <p id={CUSTOM_TOUR_MODAL_DESCRIPTION_ID} className="service-detail-description">
              {t('tours.customRequestDescription')}
            </p>

            <form className="custom-tour-form" onSubmit={handleCustomTourSubmit}>
              <label>
                {t('tours.form.fullName')}
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  placeholder={t('tours.form.placeholderFullName')}
                  required
                />
              </label>

              <label>
                {t('tours.form.email')}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder={t('tours.form.placeholderEmail')}
                  required
                />
              </label>

              <label>
                {t('tours.form.phone')}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder={t('tours.form.placeholderPhone')}
                />
              </label>

              {prefilledTourName ? (
                <p className="custom-tour-prefill-note">
                  <strong>{t('tours.form.prefilledDetailsLabel')}</strong> {prefilledTourName}.{' '}
                  {t('tours.form.prefilledDetailsNote')}
                </p>
              ) : (
                <>
                  <label>
                    {t('tours.form.tourName')}
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder={t('tours.form.placeholderTourName')}
                      required
                    />
                  </label>

                  <label>
                    {t('tours.form.durationDays')}
                    <input
                      type="number"
                      name="durationDays"
                      min={1}
                      value={formData.durationDays}
                      onChange={handleFormChange}
                      placeholder={t('tours.form.placeholderDurationDays')}
                      required
                    />
                  </label>

                  <label>
                    {t('tours.form.destination')}
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleFormChange}
                      placeholder={t('tours.form.placeholderDestination')}
                      required
                    />
                  </label>

                  <label>
                    {t('tours.form.interests')}
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleFormChange}
                      placeholder={t('tours.form.placeholderInterests')}
                      required
                    />
                  </label>
                </>
              )}

              <label>
                {t('tours.form.travelStyle')}
                <select name="travelStyle" value={formData.travelStyle} onChange={handleFormChange}>
                  <option value="Private">{t('tours.form.stylePrivate')}</option>
                  <option value="Group">{t('tours.form.styleGroup')}</option>
                  <option value="Luxury">{t('tours.form.styleLuxury')}</option>
                  <option value="Mid-range">{t('tours.form.styleMidRange')}</option>
                  <option value="Budget">{t('tours.form.styleBudget')}</option>
                </select>
              </label>

              <label>
                {t('tours.form.groupSize')}
                <input
                  type="number"
                  name="groupSize"
                  min={1}
                  value={formData.groupSize}
                  onChange={handleFormChange}
                  placeholder={t('tours.form.placeholderGroupSize')}
                />
              </label>

              <label>
                {t('tours.form.budget')}
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleFormChange}
                  placeholder={t('tours.form.placeholderBudget')}
                />
              </label>

              <label className="custom-tour-notes">
                {t('tours.form.additionalNotes')}
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder={t('tours.form.placeholderNotes')}
                />
              </label>

              <div className="custom-tour-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmittingRequest}>
                  {isSubmittingRequest ? t('tours.form.sending') : t('tours.form.submit')}
                </button>
              </div>
            </form>
            {submitRequestError ? <p className="form-error">{submitRequestError}</p> : null}
          </article>
        </div>
      ) : null}
    </>
  )
}
