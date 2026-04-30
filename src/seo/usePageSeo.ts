import { useEffect, useMemo } from 'react'
import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_IMAGE,
  SITE_AUTHOR,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  buildBreadcrumbStructuredData,
  buildDefaultStructuredData,
  buildWebPageStructuredData,
  normalizeRoutePath,
  toAbsoluteUrl,
} from './siteMetadata'
import { dedupeKeywords } from './keywordClusters'

type StructuredData = Record<string, unknown>

type PageSeoOptions = {
  title: string
  description?: string
  path?: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  keywords?: string[]
  type?: 'website' | 'article'
  noIndex?: boolean
  preloadImage?: string
  structuredData?: StructuredData | StructuredData[]
  locale?: string
  author?: string
  twitterCard?: 'summary' | 'summary_large_image'
  publishedTime?: string
  modifiedTime?: string
}

const STRUCTURED_DATA_SCRIPT_ID = 'page-structured-data'
const PRELOAD_IMAGE_LINK_ID = 'page-preload-image'
const INDEXABLE_ROBOTS_DIRECTIVE =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
const NOINDEX_ROBOTS_DIRECTIVE = 'noindex,nofollow,noarchive,max-image-preview:none'
const STRUCTURED_DATA_ABSOLUTE_URL_KEYS = new Set([
  'url',
  'logo',
  'image',
  'thumbnailUrl',
  'contentUrl',
  'sameAs',
  '@id',
  'mainEntityOfPage',
  'item',
])

function buildAutoPageKeywords(title: string, description: string) {
  const cleanedTitle = title.replace(/\s+\|\s+.+$/, '').trim()
  const descriptionFragments = description
    .split(/[.!?]/)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length >= 12)
    .slice(0, 2)

  return dedupeKeywords([cleanedTitle, ...descriptionFragments])
}

function buildReadablePathLabel(segment: string) {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase())
}

function buildPageBreadcrumbs(path: string, pageTitle: string) {
  const pathSegments = normalizeRoutePath(path).split('/').filter(Boolean)
  const cleanedPageTitle = pageTitle.replace(/\s+\|\s+.+$/, '').trim()
  const breadcrumbs = [{ name: 'Home', path: '/' }]

  if (pathSegments.length === 0) {
    return breadcrumbs
  }

  let cumulativePath = ''

  pathSegments.forEach((segment, index) => {
    cumulativePath += `/${segment}`
    const isLastSegment = index === pathSegments.length - 1

    breadcrumbs.push({
      name:
        isLastSegment && cleanedPageTitle.length > 0
          ? cleanedPageTitle
          : buildReadablePathLabel(segment),
      path: cumulativePath,
    })
  })

  return breadcrumbs
}

function inferImageMimeType(imageUrl: string): string | null {
  const normalizedPath = imageUrl.split('?')[0].split('#')[0].toLowerCase()

  if (normalizedPath.endsWith('.png')) {
    return 'image/png'
  }

  if (normalizedPath.endsWith('.jpg') || normalizedPath.endsWith('.jpeg')) {
    return 'image/jpeg'
  }

  if (normalizedPath.endsWith('.webp')) {
    return 'image/webp'
  }

  if (normalizedPath.endsWith('.gif')) {
    return 'image/gif'
  }

  if (normalizedPath.endsWith('.avif')) {
    return 'image/avif'
  }

  return null
}

function setNamedMeta(name: string, content: string | null) {
  const normalizedContent = content?.trim() ?? ''
  const existingElement = document.head.querySelector(`meta[name="${name}"]`)

  if (normalizedContent.length === 0) {
    existingElement?.remove()
    return
  }

  const element =
    (existingElement as HTMLMetaElement | null) ?? document.createElement('meta')

  if (!existingElement) {
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', normalizedContent)
}

function setPropertyMeta(property: string, content: string | null) {
  const normalizedContent = content?.trim() ?? ''
  const existingElement = document.head.querySelector(`meta[property="${property}"]`)

  if (normalizedContent.length === 0) {
    existingElement?.remove()
    return
  }

  const element =
    (existingElement as HTMLMetaElement | null) ?? document.createElement('meta')

  if (!existingElement) {
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', normalizedContent)
}

function upsertCanonical(url: string) {
  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.href = url
}

function upsertPreloadImage(href: string | null) {
  let preload = document.head.querySelector(
    `link#${PRELOAD_IMAGE_LINK_ID}`,
  ) as HTMLLinkElement | null

  if (!href) {
    preload?.remove()
    return
  }

  if (!preload) {
    preload = document.createElement('link')
    preload.id = PRELOAD_IMAGE_LINK_ID
    preload.rel = 'preload'
    preload.as = 'image'
    document.head.appendChild(preload)
  }

  preload.href = href
}

function upsertStructuredData(structuredData: StructuredData[] | null) {
  let script = document.getElementById(STRUCTURED_DATA_SCRIPT_ID) as HTMLScriptElement | null

  if (!structuredData || structuredData.length === 0) {
    script?.remove()
    return
  }

  if (!script) {
    script = document.createElement('script')
    script.id = STRUCTURED_DATA_SCRIPT_ID
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData)
}

function normalizeStructuredDataValue(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeStructuredDataValue(item, key))
  }

  if (value && typeof value === 'object') {
    const normalizedObject: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([entryKey, entryValue]) => {
      normalizedObject[entryKey] = normalizeStructuredDataValue(entryValue, entryKey)
    })
    return normalizedObject
  }

  if (
    typeof value === 'string' &&
    key &&
    STRUCTURED_DATA_ABSOLUTE_URL_KEYS.has(key) &&
    value.trim().length > 0
  ) {
    return toAbsoluteUrl(value)
  }

  return value
}

export function usePageSeo({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path,
  image = DEFAULT_SEO_IMAGE,
  imageAlt,
  imageWidth = 1200,
  imageHeight = 630,
  keywords,
  type = 'website',
  noIndex = false,
  preloadImage,
  structuredData,
  locale = SITE_LOCALE,
  author = SITE_AUTHOR,
  twitterCard = 'summary_large_image',
  publishedTime,
  modifiedTime,
}: PageSeoOptions) {
  const normalizedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const normalizedPath = path
    ? normalizeRoutePath(path)
    : normalizeRoutePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  const canonicalUrl = useMemo(() => toAbsoluteUrl(normalizedPath), [normalizedPath])
  const absoluteImageUrl = useMemo(() => toAbsoluteUrl(image), [image])
  const absolutePreloadImage = useMemo(
    () => (preloadImage ? toAbsoluteUrl(preloadImage) : null),
    [preloadImage],
  )
  const imageMimeType = useMemo(() => inferImageMimeType(absoluteImageUrl), [absoluteImageUrl])
  const imageWidthContent =
    Number.isFinite(imageWidth) && imageWidth > 0 ? String(Math.round(imageWidth)) : null
  const imageHeightContent =
    Number.isFinite(imageHeight) && imageHeight > 0 ? String(Math.round(imageHeight)) : null
  const breadcrumbStructuredData = useMemo(
    () => buildBreadcrumbStructuredData(buildPageBreadcrumbs(normalizedPath, normalizedTitle)),
    [normalizedPath, normalizedTitle],
  )
  const breadcrumbId =
    breadcrumbStructuredData && typeof breadcrumbStructuredData['@id'] === 'string'
      ? breadcrumbStructuredData['@id']
      : null
  const defaultWebPageStructuredData = useMemo(
    () =>
      buildWebPageStructuredData({
        title: normalizedTitle,
        description,
        path: normalizedPath,
        locale,
        breadcrumbId,
      }),
    [breadcrumbId, description, locale, normalizedPath, normalizedTitle],
  )
  const twitterDomain = useMemo(() => {
    try {
      return new URL(canonicalUrl).hostname
    } catch {
      return null
    }
  }, [canonicalUrl])
  const normalizedStructuredData = useMemo(() => {
    if (noIndex) {
      return null
    }

    const pageStructuredData = structuredData
      ? Array.isArray(structuredData)
        ? structuredData
        : [structuredData]
      : []
    const mergedStructuredData = [
      ...buildDefaultStructuredData(),
      defaultWebPageStructuredData,
      ...(breadcrumbStructuredData ? [breadcrumbStructuredData] : []),
      ...pageStructuredData,
    ]

    return mergedStructuredData.map((entry) => normalizeStructuredDataValue(entry) as StructuredData)
  }, [breadcrumbStructuredData, defaultWebPageStructuredData, noIndex, structuredData])
  const mergedKeywords = useMemo(() => {
    const explicitKeywords = keywords ?? []
    const autoKeywords = buildAutoPageKeywords(normalizedTitle, description)
    return dedupeKeywords([...explicitKeywords, ...autoKeywords]).slice(0, 120)
  }, [description, keywords, normalizedTitle])

  useEffect(() => {
    document.title = normalizedTitle

    const robotsDirective = noIndex ? NOINDEX_ROBOTS_DIRECTIVE : INDEXABLE_ROBOTS_DIRECTIVE
    const normalizedImageAlt = imageAlt ?? normalizedTitle
    const twitterHandle =
      SITE_TWITTER_HANDLE.length > 0
        ? SITE_TWITTER_HANDLE.startsWith('@')
          ? SITE_TWITTER_HANDLE
          : `@${SITE_TWITTER_HANDLE}`
        : null

    setNamedMeta('description', description)
    setNamedMeta('author', author)
    setNamedMeta('robots', robotsDirective)
    setNamedMeta('googlebot', robotsDirective)
    setNamedMeta('keywords', mergedKeywords.length > 0 ? mergedKeywords.join(', ') : null)

    setPropertyMeta('og:title', normalizedTitle)
    setPropertyMeta('og:description', description)
    setPropertyMeta('og:type', type)
    setPropertyMeta('og:url', canonicalUrl)
    setPropertyMeta('og:image', absoluteImageUrl)
    setPropertyMeta('og:image:secure_url', absoluteImageUrl)
    setPropertyMeta('og:image:type', imageMimeType)
    setPropertyMeta('og:image:width', imageWidthContent)
    setPropertyMeta('og:image:height', imageHeightContent)
    setPropertyMeta('og:image:alt', normalizedImageAlt)
    setPropertyMeta('og:site_name', SITE_NAME)
    setPropertyMeta('og:locale', locale)

    setNamedMeta('twitter:card', twitterCard)
    setNamedMeta('twitter:title', normalizedTitle)
    setNamedMeta('twitter:description', description)
    setNamedMeta('twitter:image', absoluteImageUrl)
    setNamedMeta('twitter:image:alt', normalizedImageAlt)
    setNamedMeta('twitter:url', canonicalUrl)
    setNamedMeta('twitter:domain', twitterDomain)
    setNamedMeta('twitter:site', twitterHandle)
    setNamedMeta('twitter:creator', twitterHandle)

    if (type === 'article') {
      setPropertyMeta('article:published_time', publishedTime ?? null)
      setPropertyMeta('article:modified_time', modifiedTime ?? null)
    } else {
      setPropertyMeta('article:published_time', null)
      setPropertyMeta('article:modified_time', null)
    }

    upsertCanonical(canonicalUrl)
    upsertPreloadImage(absolutePreloadImage)
    upsertStructuredData(normalizedStructuredData)
  }, [
    absoluteImageUrl,
    absolutePreloadImage,
    author,
    canonicalUrl,
    description,
    imageHeightContent,
    imageAlt,
    imageMimeType,
    imageWidthContent,
    locale,
    mergedKeywords,
    modifiedTime,
    noIndex,
    normalizedStructuredData,
    normalizedTitle,
    publishedTime,
    twitterDomain,
    twitterCard,
    type,
  ])
}
