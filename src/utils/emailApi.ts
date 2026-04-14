import faviconImage from '../assets/favicon.ico'
import logoImage from '../assets/logo.png'
import {
  BUSINESS_CONTACT_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE_PRIMARY,
  BUSINESS_PHONE_SECONDARY,
  BUSINESS_PHONE_TERTIARY,
} from './businessInfo'
import { readEnvValue, readEnvValueOr } from './env'

const EMAIL_API_URL = readEnvValueOr(
  import.meta.env.VITE_EMAILJS_API_URL,
  'https://api.emailjs.com/api/v1.0/email/send',
)
const EMAILJS_SERVICE_ID = readEnvValue(import.meta.env.VITE_EMAILJS_SERVICE_ID)
const LEGACY_EMAILJS_TEMPLATE_ID = readEnvValue(import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
const EMAILJS_CONTACT_TEMPLATE_ID =
  readEnvValue(import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID) || LEGACY_EMAILJS_TEMPLATE_ID
const EMAILJS_CUSTOM_TOUR_TEMPLATE_ID =
  readEnvValue(import.meta.env.VITE_EMAILJS_CUSTOM_TOUR_TEMPLATE_ID) || LEGACY_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = readEnvValue(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

type BaseEmailApiPayload = {
  subject: string
  body: string
  fromName: string
  fromEmail: string
  submittedAt: string
}

type ContactOnlyEmailApiPayload = BaseEmailApiPayload & {
  source: 'contact'
  phone: string
  country: string
  helpTopic: string
  preferredContactMethod: string
  additionalDetails: string
}

type CustomTourEmailApiPayload = BaseEmailApiPayload & {
  source: 'custom-tour'
  phone: string
  tourName: string
  durationDays: string
  destination: string
  interests: string
  travelStyle: string
  groupSize: string
  budget: string
  additionalDetails: string
}

export type EmailApiPayload = ContactOnlyEmailApiPayload | CustomTourEmailApiPayload

const getEmailJsTemplateId = (source: EmailApiPayload['source']): string | undefined => {
  if (source === 'contact') {
    return EMAILJS_CONTACT_TEMPLATE_ID
  }

  if (source === 'custom-tour') {
    return EMAILJS_CUSTOM_TOUR_TEMPLATE_ID
  }

  return undefined
}

const getMissingEmailJsFields = (source: EmailApiPayload['source']): string[] => {
  const missing: string[] = []

  if (!EMAILJS_SERVICE_ID) {
    missing.push('VITE_EMAILJS_SERVICE_ID')
  }

  if (!EMAILJS_PUBLIC_KEY) {
    missing.push('VITE_EMAILJS_PUBLIC_KEY')
  }

  if (source === 'contact' && !EMAILJS_CONTACT_TEMPLATE_ID) {
    missing.push('VITE_EMAILJS_CONTACT_TEMPLATE_ID (or VITE_EMAILJS_TEMPLATE_ID)')
  }

  if (source === 'custom-tour' && !EMAILJS_CUSTOM_TOUR_TEMPLATE_ID) {
    missing.push('VITE_EMAILJS_CUSTOM_TOUR_TEMPLATE_ID (or VITE_EMAILJS_TEMPLATE_ID)')
  }

  return missing
}

const buildPreviewText = (payload: EmailApiPayload): string => {
  if (payload.source === 'contact') {
    return `${payload.helpTopic} | ${payload.preferredContactMethod} | ${payload.country}`
  }

  return `${payload.destination} | ${payload.durationDays} days | ${payload.travelStyle}`
}

const buildInquiryHeading = (payload: EmailApiPayload): string =>
  payload.source === 'contact' ? 'New Contact Support Inquiry' : 'New Custom Tour Request'

const toAbsoluteAssetUrl = (assetPath: string): string => {
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath
  }

  if (typeof window === 'undefined') {
    return assetPath
  }

  return new URL(assetPath, window.location.origin).href
}

const buildTemplateParams = (payload: EmailApiPayload) => {
  const baseParams = {
    to_email: BUSINESS_CONTACT_EMAIL,
    business_name: BUSINESS_NAME,
    business_email: BUSINESS_CONTACT_EMAIL,
    business_phone_primary: BUSINESS_PHONE_PRIMARY,
    business_phone_secondary: BUSINESS_PHONE_SECONDARY,
    business_phone_tertiary: BUSINESS_PHONE_TERTIARY,
    business_website: window.location.origin,
    logo_url: toAbsoluteAssetUrl(logoImage),
    favicon_url: toAbsoluteAssetUrl(faviconImage),
    from_name: payload.fromName,
    from_email: payload.fromEmail,
    reply_to: payload.fromEmail,
    subject: payload.subject,
    message: payload.body,
    message_plain: payload.body,
    source: payload.source,
    inquiry_heading: buildInquiryHeading(payload),
    source_label: payload.source === 'contact' ? 'Contact Us Form' : 'Request A Tour Form',
    preview_text: buildPreviewText(payload),
    submitted_at: payload.submittedAt,
  }

  if (payload.source === 'contact') {
    return {
      ...baseParams,
      phone: payload.phone,
      country: payload.country,
      help_topic: payload.helpTopic,
      preferred_contact_method: payload.preferredContactMethod,
      additional_details: payload.additionalDetails,
    }
  }

  return {
    ...baseParams,
    phone: payload.phone,
    tour_name: payload.tourName,
    duration_days: payload.durationDays,
    destination: payload.destination,
    interests: payload.interests,
    travel_style: payload.travelStyle,
    group_size: payload.groupSize,
    budget: payload.budget,
    notes: payload.additionalDetails,
  }
}

export const sendEmailWithApi = async (payload: EmailApiPayload): Promise<void> => {
  const templateId = getEmailJsTemplateId(payload.source)
  const missingFields = getMissingEmailJsFields(payload.source)

  if (missingFields.length > 0 || !templateId) {
    const missingSummary =
      missingFields.length > 0 ? `Missing ${missingFields.join(', ')}. ` : ''
    throw new Error(
      `Email API is not configured. ${missingSummary}Check your .env file and restart the dev server after updates.`,
    )
  }

  const response = await fetch(EMAIL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: buildTemplateParams(payload),
    }),
  })

  if (!response.ok) {
    const responseText = await response.text().catch(() => '')
    const details = responseText.trim()
    throw new Error(
      details.length > 0
        ? `Email service error: ${details}`
        : `Email API request failed with status ${response.status}.`,
    )
  }
}
