import logoImage from '../assets/logo.png'

export const SITE_NAME = 'Kigezi Wildlife Vacation Safaris'
export const SITE_AUTHOR = SITE_NAME
export const SITE_LANGUAGE = 'en'
export const SITE_LOCALE = 'en_US'
export const DEFAULT_SEO_DESCRIPTION =
  'Uganda-focused safari planning for primates, wildlife, and custom East Africa itineraries.'
export const DEFAULT_SEO_IMAGE = logoImage
const configuredSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() ?? ''
export const FALLBACK_SITE_ORIGIN =
  /^https?:\/\//i.test(configuredSiteUrl) && configuredSiteUrl.length > 0
    ? configuredSiteUrl.replace(/\/+$/, '')
    : 'https://kigeziwildlifevacationsafaris.com'
export const SITE_TWITTER_HANDLE = (import.meta.env.VITE_TWITTER_HANDLE as string | undefined)?.trim() ?? ''
const configuredBusinessSocialLinks =
  (import.meta.env.VITE_BUSINESS_SOCIAL_LINKS as string | undefined)?.trim() ?? ''
export const BUSINESS_CONTACT_EMAIL = 'kigeziwildlifevacationltd@gmail.com'
export const BUSINESS_PHONE_PRIMARY = '+256772630450'
export const BUSINESS_PHONE_SECONDARY = '+256760228289'
export const BUSINESS_PHONE_TERTIARY = '+256774605726'
export const BUSINESS_OFFICE_LOCALITY = 'Kampala'
export const BUSINESS_OFFICE_COUNTRY_CODE = 'UG'
export const BUSINESS_AVAILABLE_LANGUAGES = [
  'English',
  'French',
  'German',
  'Spanish',
  'Italian',
  'Russian',
  'Portuguese',
] as const
export const BUSINESS_SOCIAL_LINKS = configuredBusinessSocialLinks
  .split(',')
  .map((value) => value.trim())
  .filter((value) => /^https?:\/\//i.test(value))

function isLocalDevelopmentOrigin(origin: string): boolean {
  return /:\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[::1\])(?::\d+)?$/i.test(origin)
}

type StructuredData = Record<string, unknown>
type BreadcrumbItem = {
  name: string
  path: string
}

type WebPageStructuredDataOptions = {
  title: string
  description: string
  path: string
  locale?: string
  breadcrumbId?: string | null
}

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin.trim().length > 0) {
    const currentOrigin = window.location.origin.trim()

    if (isLocalDevelopmentOrigin(currentOrigin)) {
      return currentOrigin
    }
  }

  return FALLBACK_SITE_ORIGIN
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  const normalizedValue = pathOrUrl.trim()

  if (/^[a-z][a-z\d+.-]*:/i.test(normalizedValue)) {
    return normalizedValue
  }

  const origin = getSiteOrigin()
  const normalizedPath = normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`
  return new URL(normalizedPath, `${origin}/`).href
}

export function normalizeRoutePath(path: string): string {
  const [pathWithoutHash] = path.split('#')
  const [pathname] = pathWithoutHash.split('?')

  if (!pathname || pathname === '') {
    return '/'
  }

  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (normalizedPathname === '/') {
    return normalizedPathname
  }

  return normalizedPathname.replace(/\/+$/, '')
}

function normalizeLocaleForStructuredData(locale: string | undefined): string {
  const fallbackLocale = SITE_LOCALE.replace('_', '-')

  if (!locale) {
    return fallbackLocale
  }

  return locale.replace('_', '-')
}

export function buildBreadcrumbStructuredData(items: readonly BreadcrumbItem[]): StructuredData | null {
  const dedupedItems = items.reduce<BreadcrumbItem[]>((accumulator, item) => {
    const normalizedName = item.name.trim()
    const normalizedPath = normalizeRoutePath(item.path)

    if (normalizedName.length === 0 || accumulator.some((entry) => entry.path === normalizedPath)) {
      return accumulator
    }

    accumulator.push({
      name: normalizedName,
      path: normalizedPath,
    })

    return accumulator
  }, [])

  if (dedupedItems.length === 0) {
    return null
  }

  const lastItem = dedupedItems[dedupedItems.length - 1]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${toAbsoluteUrl(lastItem.path)}#breadcrumb`,
    itemListElement: dedupedItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}

export function buildWebPageStructuredData({
  title,
  description,
  path,
  locale,
  breadcrumbId,
}: WebPageStructuredDataOptions): StructuredData {
  const origin = getSiteOrigin()
  const normalizedPath = normalizeRoutePath(path)
  const pageUrl = toAbsoluteUrl(normalizedPath)
  const websiteId = `${origin}#website`
  const normalizedLocale = normalizeLocaleForStructuredData(locale)
  const output: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: normalizedLocale,
    isPartOf: {
      '@id': websiteId,
    },
    about: {
      '@id': `${origin}#organization`,
    },
  }

  if (breadcrumbId) {
    output.breadcrumb = {
      '@id': breadcrumbId,
    }
  }

  return output
}

export function buildDefaultStructuredData(): StructuredData[] {
  const origin = getSiteOrigin()
  const websiteId = `${origin}#website`
  const organizationId = `${origin}#organization`
  const logoUrl = toAbsoluteUrl(DEFAULT_SEO_IMAGE)
  const travelAgencyData: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': organizationId,
    url: origin,
    name: SITE_NAME,
    description: DEFAULT_SEO_DESCRIPTION,
    email: BUSINESS_CONTACT_EMAIL,
    telephone: BUSINESS_PHONE_PRIMARY,
    logo: logoUrl,
    image: logoUrl,
    slogan: 'Exclusive Tours into the Wild',
    foundingDate: '2014',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS_OFFICE_LOCALITY,
      addressCountry: BUSINESS_OFFICE_COUNTRY_CODE,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: BUSINESS_PHONE_PRIMARY,
        email: BUSINESS_CONTACT_EMAIL,
        availableLanguage: BUSINESS_AVAILABLE_LANGUAGES,
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: BUSINESS_PHONE_SECONDARY,
        email: BUSINESS_CONTACT_EMAIL,
        availableLanguage: BUSINESS_AVAILABLE_LANGUAGES,
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: BUSINESS_PHONE_TERTIARY,
        email: BUSINESS_CONTACT_EMAIL,
        availableLanguage: BUSINESS_AVAILABLE_LANGUAGES,
      },
    ],
    areaServed: [
      {
        '@type': 'Country',
        name: 'Uganda',
      },
      {
        '@type': 'Place',
        name: 'East Africa',
      },
    ],
    availableLanguage: BUSINESS_AVAILABLE_LANGUAGES,
    hasOfferCatalog: [
      {
        '@type': 'OfferCatalog',
        name: 'Uganda Safari Tours',
        url: toAbsoluteUrl('/tours'),
      },
      {
        '@type': 'OfferCatalog',
        name: 'Travel Services',
        url: toAbsoluteUrl('/services'),
      },
    ],
    knowsAbout: [
      'Uganda safari tours',
      'Uganda safari packages',
      'gorilla trekking Uganda',
      'wildlife safari planning',
      'custom East Africa itineraries',
    ],
  }

  if (BUSINESS_SOCIAL_LINKS.length > 0) {
    travelAgencyData.sameAs = BUSINESS_SOCIAL_LINKS
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      url: origin,
      name: SITE_NAME,
      inLanguage: SITE_LANGUAGE,
      description: DEFAULT_SEO_DESCRIPTION,
      about: {
        '@id': organizationId,
      },
      publisher: {
        '@id': organizationId,
      },
    },
    travelAgencyData,
  ]
}
