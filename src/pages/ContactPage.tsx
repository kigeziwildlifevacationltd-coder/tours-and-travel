import { useState } from 'react'
import type { FormEvent } from 'react'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'
import {
  BUSINESS_PHONE_PRIMARY,
  BUSINESS_PHONE_SECONDARY,
  BUSINESS_PHONE_TERTIARY,
} from '../utils/businessInfo'
import { sendEmailWithApi } from '../utils/emailApi'
import {
  BUSINESS_CONTACT_EMAIL,
  buildEmailBody,
  toEmailValue,
} from '../utils/emailDraft'

export function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const contactNumbers = [
    BUSINESS_PHONE_PRIMARY,
    BUSINESS_PHONE_SECONDARY,
    BUSINESS_PHONE_TERTIARY,
  ]
  const contactEmail = BUSINESS_CONTACT_EMAIL
  const weeklyHours = [
    { day: t('contact.hours.monday'), hours: t('contact.hours.mondayValue') },
    { day: t('contact.hours.tuesday'), hours: t('contact.hours.tuesdayValue') },
    { day: t('contact.hours.wednesday'), hours: t('contact.hours.wednesdayValue') },
    { day: t('contact.hours.thursday'), hours: t('contact.hours.thursdayValue') },
    { day: t('contact.hours.friday'), hours: t('contact.hours.fridayValue') },
    { day: t('contact.hours.saturday'), hours: t('contact.hours.saturdayValue') },
    { day: t('contact.hours.sunday'), hours: t('contact.hours.sundayValue') },
  ]
  const contactIntentKeywords = buildEntityKeywordCluster(
    'service',
    [
      t('contact.form.helpTopicGeneral'),
      t('contact.form.helpTopicBooking'),
      t('contact.form.helpTopicDocumentation'),
      t('contact.form.helpTopicTransport'),
      t('contact.form.helpTopicPayment'),
      t('contact.form.helpTopicTechnical'),
      t('contact.form.helpTopicOther'),
      'Uganda safari booking support',
      'gorilla trekking permit support',
    ],
    24,
  )
  const contactPageKeywordCluster = buildPageKeywordCluster(
    UGANDA_SAFARI_KEYWORDS,
    GORILLA_TREKKING_KEYWORDS,
    contactIntentKeywords,
    110,
  )

  usePageSeo({
    title: t('contact.heroTitle'),
    description: t('contact.heroDescription'),
    path: '/contact-us',
    image: '/images/group-seated-at-forest-viewpoint-0058.jpg',
    imageAlt: 'Uganda safari booking and travel support contact',
    preloadImage: '/images/group-seated-at-forest-viewpoint-0058.jpg',
    keywords: contactPageKeywordCluster,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: t('contact.heroTitle'),
      description: t('contact.heroDescription'),
      mainEntity: {
        '@type': 'TravelAgency',
        name: 'Kigezi Wildlife Vacation Safaris',
        email: contactEmail,
        telephone: contactNumbers[0],
      },
    },
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    setSubmitted(false)

    const formElement = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const notProvided = t('tours.email.notProvided')
    const resolveFieldValue = (name: string) => (formData.get(name) ?? '').toString()
    const submittedAt = new Date().toLocaleString()
    const contactMethodValue = resolveFieldValue('contactMethod')
    const helpTopicValue = resolveFieldValue('helpTopic')
    const helpTopicLabel = (() => {
      if (helpTopicValue === 'booking-support') {
        return t('contact.form.helpTopicBooking')
      }

      if (helpTopicValue === 'documentation') {
        return t('contact.form.helpTopicDocumentation')
      }

      if (helpTopicValue === 'transport-logistics') {
        return t('contact.form.helpTopicTransport')
      }

      if (helpTopicValue === 'payment-billing') {
        return t('contact.form.helpTopicPayment')
      }

      if (helpTopicValue === 'website-technical') {
        return t('contact.form.helpTopicTechnical')
      }

      if (helpTopicValue === 'other') {
        return t('contact.form.helpTopicOther')
      }

      if (helpTopicValue === 'general-support') {
        return t('contact.form.helpTopicGeneral')
      }

      return notProvided
    })()
    const preferredContactMethod = (() => {
      if (contactMethodValue === 'phone') {
        return t('contact.form.contactMethodPhone')
      }

      if (contactMethodValue === 'whatsapp') {
        return t('contact.form.contactMethodWhatsApp')
      }

      if (contactMethodValue === 'email') {
        return t('contact.form.contactMethodEmail')
      }

      return notProvided
    })()
    const subjectSeed = toEmailValue(
      resolveFieldValue('subject') || helpTopicLabel,
      t('contact.email.subjectFallback'),
    )
    const subject = `${t('contact.email.subjectPrefix')}${subjectSeed}`
    const body = buildEmailBody({
      title: t('contact.email.heading'),
      intro: t('contact.email.intro'),
      sections: [
        {
          title: t('contact.email.sectionTraveler'),
          fields: [
            {
              label: t('contact.form.fullName'),
              value: toEmailValue(resolveFieldValue('name'), notProvided),
            },
            {
              label: t('contact.form.email'),
              value: toEmailValue(resolveFieldValue('email'), notProvided),
            },
            {
              label: t('contact.form.phone'),
              value: toEmailValue(resolveFieldValue('phone'), notProvided),
            },
            {
              label: t('contact.form.country'),
              value: toEmailValue(resolveFieldValue('country'), notProvided),
            },
          ],
        },
        {
          title: t('contact.email.sectionSupport'),
          fields: [
            {
              label: t('contact.form.helpTopic'),
              value: helpTopicLabel,
            },
            {
              label: t('contact.form.contactMethod'),
              value: preferredContactMethod,
            },
            {
              label: t('contact.form.subject'),
              value: toEmailValue(resolveFieldValue('subject'), notProvided),
            },
          ],
        },
        {
          title: t('contact.email.sectionMessage'),
          fields: [
            {
              label: t('contact.form.message'),
              value: toEmailValue(resolveFieldValue('message'), notProvided),
            },
            {
              label: t('contact.form.additionalDetails'),
              value: toEmailValue(resolveFieldValue('additionalDetails'), notProvided),
            },
          ],
        },
      ],
      footerLines: [`${t('contact.email.generatedAt')}: ${submittedAt}`, t('contact.email.followUp')],
    })

    const visitorName = toEmailValue(resolveFieldValue('name'), 'Website Visitor')
    const visitorEmail = toEmailValue(resolveFieldValue('email'), BUSINESS_CONTACT_EMAIL)

    setIsSubmitting(true)

    try {
      await sendEmailWithApi({
        subject,
        body,
        fromName: visitorName,
        fromEmail: visitorEmail,
        source: 'contact',
        submittedAt,
        phone: toEmailValue(resolveFieldValue('phone'), notProvided),
        country: toEmailValue(resolveFieldValue('country'), notProvided),
        helpTopic: helpTopicLabel,
        preferredContactMethod,
        additionalDetails: toEmailValue(resolveFieldValue('additionalDetails'), notProvided),
      })
      formElement.reset()
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : t('contact.form.error')
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow={t('contact.heroEyebrow')}
        title={t('contact.heroTitle')}
        description={t('contact.heroDescription')}
        className="hero-actions-centered hero-actions-bottom"
        actions={[{ label: t('contact.heroActionBrowseTours'), to: '/tours' }]}
        highlights={[t('contact.heroHighlight1'), t('contact.heroHighlight2'), t('contact.heroHighlight3')]}
        panel={{
          title: t('contact.heroPanelTitle'),
          points: [
            t('contact.heroPanelPoint1'),
            t('contact.heroPanelPoint2'),
            t('contact.heroPanelPoint3'),
          ],
        }}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container contact-layout">
          <article className="content-card">
            <SectionHeading title={t('contact.detailsTitle')} />
            <p>
              {t('footer.email')}:{' '}
              <a href={`mailto:${contactEmail}`} className="contact-inline-link">
                {contactEmail}
              </a>
            </p>
            <p className="contact-detail-label">{t('contact.phoneNumbersTitle')}:</p>
            <ul className="contact-list">
              {contactNumbers.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} className="contact-inline-link">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              {t('footer.office')}: {t('common.officeValue')}
            </p>
            <p className="contact-detail-label">{t('contact.workingHoursTitle')}:</p>
            <ul className="contact-list contact-hours-list">
              {weeklyHours.map((item) => (
                <li key={item.day}>
                  <span>{item.day}</span>
                  <span>{item.hours}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="content-card">
            <SectionHeading title={t('contact.inquiryTitle')} />
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="contact-form-row">
                <label>
                  {t('contact.form.fullName')}
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder={t('contact.form.placeholderName')}
                    required
                  />
                </label>
                <label>
                  {t('contact.form.email')}
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={t('contact.form.placeholderEmail')}
                    required
                  />
                </label>
              </div>
              <div className="contact-form-row">
                <label>
                  {t('contact.form.phone')}
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder={t('contact.form.placeholderPhone')}
                  />
                </label>
                <label>
                  {t('contact.form.country')}
                  <input
                    type="text"
                    name="country"
                    autoComplete="country-name"
                    placeholder={t('contact.form.placeholderCountry')}
                  />
                </label>
              </div>
              <div className="contact-form-row">
                <label>
                  {t('contact.form.helpTopic')}
                  <select name="helpTopic" defaultValue="" required>
                    <option value="" disabled>
                      {t('contact.form.placeholderHelpTopic')}
                    </option>
                    <option value="general-support">{t('contact.form.helpTopicGeneral')}</option>
                    <option value="booking-support">{t('contact.form.helpTopicBooking')}</option>
                    <option value="documentation">{t('contact.form.helpTopicDocumentation')}</option>
                    <option value="transport-logistics">{t('contact.form.helpTopicTransport')}</option>
                    <option value="payment-billing">{t('contact.form.helpTopicPayment')}</option>
                    <option value="website-technical">{t('contact.form.helpTopicTechnical')}</option>
                    <option value="other">{t('contact.form.helpTopicOther')}</option>
                  </select>
                </label>
                <label>
                  {t('contact.form.contactMethod')}
                  <select name="contactMethod" defaultValue="" required>
                    <option value="" disabled>
                      {t('contact.form.placeholderContactMethod')}
                    </option>
                    <option value="email">{t('contact.form.contactMethodEmail')}</option>
                    <option value="phone">{t('contact.form.contactMethodPhone')}</option>
                    <option value="whatsapp">{t('contact.form.contactMethodWhatsApp')}</option>
                  </select>
                </label>
              </div>
              <label>
                {t('contact.form.subject')}
                <input
                  type="text"
                  name="subject"
                  placeholder={t('contact.form.placeholderSubject')}
                  required
                />
              </label>
              <label>
                {t('contact.form.message')}
                <textarea
                  name="message"
                  rows={5}
                  placeholder={t('contact.form.placeholderMessage')}
                  required
                />
              </label>
              <label>
                {t('contact.form.additionalDetails')}
                <textarea
                  name="additionalDetails"
                  rows={4}
                  placeholder={t('contact.form.placeholderAdditionalDetails')}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t('contact.form.sending') : t('contact.form.sendInquiry')}
              </button>
            </form>
            {submitted ? (
              <p className="form-success">{t('contact.form.success')}</p>
            ) : null}
            {submitError ? <p className="form-error">{submitError}</p> : null}
          </article>
        </div>
      </section>
    </>
  )
}
