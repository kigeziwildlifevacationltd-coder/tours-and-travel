import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const siteContentPath = path.join(projectRoot, 'src', 'data', 'siteContent.ts')
const fallbackSiteUrl = 'https://kigeziwildlifevacationsafaris.com'

const siteName = 'Kigezi Wildlife Vacation Safaris'
const siteLanguage = 'en'
const siteLocale = 'en_US'
const defaultDescription =
  'Uganda-focused safari planning for primates, wildlife, and custom East Africa itineraries.'
const businessEmail = 'kigeziwildlifevacationltd@gmail.com'
const businessPhones = ['+256772630450', '+256760228289', '+256774605726']
const staticPageCatalog = {
  '/': {
    title: 'Safari Journeys Across Uganda And East Africa',
    description:
      'Plan gorilla trekking, wildlife game drives, and custom itineraries with a local team that handles every detail from arrival to return.',
    image: '/images/mountain-road-panorama-0046.jpg',
    eyebrow: 'Uganda Safari Specialists',
    intro:
      'Plan gorilla trekking, wildlife game drives, and custom itineraries with a local team that handles every detail from arrival to return.',
  },
  '/tours': {
    title: 'Explore Our Safari Tours',
    description:
      'Choose from short primate experiences to extended multi-park expeditions across Uganda.',
    image: '/images/safari-vehicle-in-grassland-0093.jpg',
    eyebrow: 'Tours',
    intro:
      'Published safari itineraries range from short primate trips to longer wildlife circuits, and each one can be adapted to your pace, budget, and travel goals.',
  },
  '/services': {
    title: 'Travel Services That Support Every Safari Step',
    description:
      'From arrival logistics to documentation support, we coordinate the details so you can focus on the experience.',
    image: '/images/luxury-lodge-aerial-view-0094.jpg',
    eyebrow: 'Services',
    intro:
      'Our service team supports planning, reservations, permits, transport coordination, and trip operations before and during your safari.',
  },
  '/destinations': {
    title: 'Top Uganda Safari Destinations',
    description:
      'Explore the core Uganda destinations featured across our tour itineraries, with highlights to help you choose the right route.',
    image: '/images/lake-islands-overlook-0031.jpg',
    eyebrow: 'Destinations',
    intro:
      'Browse the Uganda destinations featured throughout our itineraries, from primate forests and savannah parks to lake regions and highland stopovers.',
  },
  '/about': {
    title: 'A Local Team Focused On Memorable Safaris',
    description:
      'Kigezi Wildlife Vacation Safaris helps travelers discover East Africa through well-planned, wildlife-rich journeys.',
    image: '/images/sunset-over-mountain-ridges-0081.jpg',
    eyebrow: 'About',
    intro:
      'We combine local field experience, practical route design, and clear communication to build Uganda-focused safaris that work smoothly on the ground.',
  },
  '/gallery': {
    title: 'Safari Moments Across Uganda',
    description:
      'Explore a curated visual gallery from our wildlife routes, primate treks, scenic landscapes, and lodge experiences.',
    image: '/images/gorilla-family-in-forest-0075.jpg',
    eyebrow: 'Gallery',
    intro:
      'This gallery highlights wildlife, landscapes, lodges, and safari-day moments that help travelers understand the atmosphere of our routes before booking.',
  },
  '/experiences': {
    title: 'Share Your Safari Experience',
    description:
      'Create a profile, rate your journey, and help future travelers plan with real feedback.',
    image: '/images/group-seated-at-forest-viewpoint-0058.jpg',
    eyebrow: 'Traveler Stories',
    intro:
      'Travelers can create a profile, rate their safari, and share stories that help future guests plan with practical feedback and real trip context.',
  },
  '/contact-us': {
    title: 'How Can We Help You?',
    description:
      'Send your support request and our team will respond with clear guidance and next steps.',
    image: '/images/group-seated-at-forest-viewpoint-0058.jpg',
    eyebrow: 'Contact Us',
    intro:
      'Reach our operations team for booking support, itinerary advice, documentation guidance, transport coordination, and general trip planning questions.',
  },
  '/site-map': {
    title: 'HTML Sitemap For Travelers And Search Engines',
    description:
      'Browse the main pages, published tours, services, and destination links from one crawl-friendly page.',
    image: '/images/mountain-road-panorama-0046.jpg',
    eyebrow: 'Site Map',
    intro:
      'Use this crawl-friendly page to discover the main sections of the website, published safari itineraries, services, and destination links.',
  },
}

function parseDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  const output = {}
  const content = fs.readFileSync(filePath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    output[key] = value
  }

  return output
}

function getSiteUrl() {
  const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local']
  const envFromFiles = envFiles
    .map((fileName) => parseDotEnvFile(path.join(projectRoot, fileName)))
    .reduce((accumulator, current) => ({ ...accumulator, ...current }), {})

  const rawValue = (
    process.env.VITE_SITE_URL ??
    process.env.SITE_URL ??
    envFromFiles.VITE_SITE_URL ??
    envFromFiles.SITE_URL ??
    fallbackSiteUrl
  ).trim()

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`

  return new URL(withProtocol).origin.replace(/\/+$/, '')
}

function normalizeRoutePath(routePath) {
  const [pathWithoutHash] = routePath.split('#')
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

function toAbsoluteUrl(siteUrl, pathOrUrl) {
  if (/^[a-z][a-z\d+.-]*:/i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return new URL(normalizedPath, `${siteUrl}/`).href
}

function getSiteRootUrl(siteUrl) {
  return toAbsoluteUrl(siteUrl, '/')
}

function normalizeSeoText(value) {
  return String(value)
    .replaceAll('\u2022', ' - ')
    .replaceAll('\u00e2\u20ac\u00a2', ' - ')
    .replaceAll('\u2019', "'")
    .replaceAll('\u2018', "'")
    .replaceAll('\u201c', '"')
    .replaceAll('\u201d', '"')
    .replaceAll('\u2013', '-')
    .replaceAll('\u2014', '-')
}

function escapeHtml(value) {
  return normalizeSeoText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function stripSiteName(title) {
  const suffix = ` | ${siteName}`
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}

function buildSeoImageAlt(page) {
  return `${stripSiteName(page.title)} preview image`
}

function buildBreadcrumbs(routePath, title) {
  const normalizedPath = normalizeRoutePath(routePath)
  const pathSegments = normalizedPath.split('/').filter(Boolean)
  const breadcrumbs = [{ name: 'Home', path: '/' }]

  if (pathSegments.length === 0) {
    return breadcrumbs
  }

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label =
      index === pathSegments.length - 1
        ? stripSiteName(title)
        : decodeURIComponent(segment)
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, (value) => value.toUpperCase())

    breadcrumbs.push({
      name: label,
      path: currentPath,
    })
  })

  return breadcrumbs
}

function buildStructuredData(siteUrl, page) {
  const breadcrumbs = buildBreadcrumbs(page.path, page.title)
  const canonicalUrl = page.canonicalUrl
  const siteRootUrl = getSiteRootUrl(siteUrl)
  const websiteId = `${siteRootUrl}#website`
  const organizationId = `${siteRootUrl}#organization`
  const breadcrumbId = `${canonicalUrl}#breadcrumb`
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteRootUrl,
      name: siteName,
      inLanguage: siteLanguage,
      description: defaultDescription,
      publisher: {
        '@id': organizationId,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': organizationId,
      url: siteRootUrl,
      name: siteName,
      description: defaultDescription,
      email: businessEmail,
      telephone: businessPhones[0],
      areaServed: ['Uganda', 'East Africa'],
    },
    {
      '@context': 'https://schema.org',
      '@type': page.schemaType,
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: page.title,
      description: page.description,
      inLanguage: siteLocale.replace('_', '-'),
      isPartOf: {
        '@id': websiteId,
      },
      about: {
        '@id': organizationId,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: toAbsoluteUrl(siteUrl, item.path),
      })),
    },
  ]

  if (page.kind === 'tour') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: page.heading,
      description: page.description,
      image: page.image,
      itinerary: page.summary,
      touristType: 'Wildlife travelers and primate safari guests',
      provider: {
        '@type': 'TravelAgency',
        name: siteName,
        url: `${siteUrl}/`,
      },
    })
  }

  if (page.kind === 'service') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.heading,
      description: page.description,
      image: page.image,
      provider: {
        '@type': 'TravelAgency',
        name: siteName,
        url: `${siteUrl}/`,
      },
    })
  }

  return structuredData
}

function loadSiteContentData() {
  const source = fs.readFileSync(siteContentPath, 'utf8')
  const sanitizedSource = source
    .replace(/^import .*$/gm, '')
    .replace(/export const (\w+): [^=]+ =/g, 'const $1 =')
    .replace(/export const (\w+) =/g, 'const $1 =')

  const context = {
    partnerLogo: '/logo.png',
  }

  vm.createContext(context)
  vm.runInContext(
    `${sanitizedSource}
globalThis.__SEO_ROUTE_DATA__ = { navItems, tours, destinations, services, stats };`,
    context,
  )

  return context.__SEO_ROUTE_DATA__
}

function readSitemapRoutes(siteUrl) {
  const sitemapCandidates = ['sitemap-pages.xml', 'sitemap.xml']

  for (const fileName of sitemapCandidates) {
    const sitemapPath = path.join(distDir, fileName)

    if (!fs.existsSync(sitemapPath)) {
      continue
    }

    const sitemapXml = fs.readFileSync(sitemapPath, 'utf8')

    if (!/<urlset\b/i.test(sitemapXml)) {
      continue
    }

    const routePaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => {
        const url = new URL(match[1].trim(), `${siteUrl}/`)
        return normalizeRoutePath(url.pathname)
      })
      .filter(Boolean)

    if (routePaths.length > 0) {
      return [...new Set(routePaths)]
    }
  }

  throw new Error('[seo] No page sitemap was found in dist. Run sitemap generation before prerendering routes.')
}

function extractAssetTags(templateHtml) {
  const assetTags =
    templateHtml.match(
      /<link[^>]+href="\/assets\/[^"]+"[^>]*>|<script[^>]+src="\/assets\/[^"]+"[^>]*><\/script>/g,
    ) ?? []

  return assetTags.join('\n    ')
}

function buildLinkMarkup(link) {
  return `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`
}

function renderLinkList(title, items) {
  if (!items.length) {
    return ''
  }

  const listItems = items
    .map((item) => {
      const meta = item.meta ? `<span>${escapeHtml(item.meta)}</span>` : ''
      const description = item.description ? `<p>${escapeHtml(item.description)}</p>` : ''

      return `<li><strong>${buildLinkMarkup(item)}</strong>${meta}${description}</li>`
    })
    .join('')

  return `<section class="seo-card"><h2>${escapeHtml(title)}</h2><ul class="seo-list">${listItems}</ul></section>`
}

function renderSummaryGrid(items) {
  if (!items.length) {
    return ''
  }

  return `<section class="seo-grid">${items
    .map(
      (item) =>
        `<article class="seo-card"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p></article>`,
    )
    .join('')}</section>`
}

function buildStaticPage(routePath, data) {
  const routeMeta = staticPageCatalog[routePath]

  if (!routeMeta) {
    return null
  }

  const pages = {
    '/': () => {
      const featuredTours = data.tours.filter((tour) => tour.featured).slice(0, 6)
      const featuredServices = data.services.slice(0, 6)

      return {
        kind: 'home',
        schemaType: 'WebPage',
        path: routePath,
        title: routeMeta.title,
        heading: routeMeta.title,
        description: routeMeta.description,
        summary: routeMeta.intro,
        image: routeMeta.image,
        lead: routeMeta.intro,
        sections: [
          renderSummaryGrid(
            data.stats.map((stat) => ({
              title: stat.value,
              body: stat.label,
            })),
          ),
          renderLinkList(
            'Featured Tours',
            featuredTours.map((tour) => ({
              href: `/tours/${tour.id}`,
              label: tour.title,
              meta: `${tour.duration} - ${tour.country}`,
              description: tour.summary,
            })),
          ),
          renderLinkList(
            'Core Services',
            featuredServices.map((service) => ({
              href: `/services/${service.id}`,
              label: service.name,
              description: service.description,
            })),
          ),
        ],
      }
    },
    '/tours': () => ({
      kind: 'collection',
      schemaType: 'CollectionPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderLinkList(
          'Published Uganda Safari Tours',
          data.tours.map((tour) => ({
            href: `/tours/${tour.id}`,
            label: tour.title,
            meta: `${tour.duration} - ${tour.country}`,
            description: tour.summary,
          })),
        ),
      ],
    }),
    '/services': () => ({
      kind: 'collection',
      schemaType: 'CollectionPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderLinkList(
          'Travel Services',
          data.services.map((service) => ({
            href: `/services/${service.id}`,
            label: service.name,
            description: service.description,
          })),
        ),
      ],
    }),
    '/destinations': () => ({
      kind: 'collection',
      schemaType: 'CollectionPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderLinkList(
          'Safari Destinations Featured In Our Tours',
          data.destinations.map((destination) => ({
            href: '/tours',
            label: destination.name,
            meta: destination.region,
            description: destination.summary,
          })),
        ),
      ],
    }),
    '/about': () => ({
      kind: 'static',
      schemaType: 'AboutPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderSummaryGrid([
          {
            title: 'How We Plan',
            body:
              'We start with your travel goals, season, and budget, then build a route that balances wildlife highlights with realistic pacing and dependable logistics.',
          },
          {
            title: 'Operational Snapshot',
            body:
              'These published indicators reflect our planning capacity, park coverage, and service standards for Uganda-focused safaris.',
          },
        ]),
        renderLinkList(
          'Quick Links',
          [
            { href: '/tours', label: 'Browse Safari Tours' },
            { href: '/services', label: 'Explore Travel Services' },
            { href: '/contact-us', label: 'Contact Our Team' },
          ],
        ),
      ],
    }),
    '/gallery': () => ({
      kind: 'static',
      schemaType: 'CollectionPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderSummaryGrid([
          {
            title: 'Wildlife',
            body:
              'See primates, big cats, birdlife, and savannah scenes that reflect the atmosphere of Uganda safari routes.',
          },
          {
            title: 'Landscapes',
            body:
              'Explore forests, lakes, wetlands, waterfalls, and mountain viewpoints used across our itineraries.',
          },
          {
            title: 'Safari Life',
            body:
              'Browse lodges, travel-day moments, and scenic stopovers to understand the rhythm of the trip before booking.',
          },
        ]),
        renderLinkList(
          'Continue Planning',
          [
            { href: '/tours', label: 'See Matching Tours' },
            { href: '/destinations', label: 'Explore Destinations' },
            { href: '/contact-us', label: 'Talk To The Team' },
          ],
        ),
      ],
    }),
    '/experiences': () => ({
      kind: 'static',
      schemaType: 'CollectionPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderSummaryGrid([
          {
            title: 'Create A Traveler Profile',
            body:
              'Guests can sign in securely, create a traveler profile, and publish verified feedback linked to their safari experience.',
          },
          {
            title: 'Rate A Tour',
            body:
              'Ratings and written stories help future travelers compare itineraries and understand what stood out on the ground.',
          },
        ]),
        renderLinkList(
          'Useful Routes',
          [
            { href: '/tours', label: 'Browse Tours Before Sharing' },
            { href: '/contact-us', label: 'Ask A Planning Question' },
          ],
        ),
      ],
    }),
    '/contact-us': () => ({
      kind: 'static',
      schemaType: 'ContactPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderSummaryGrid([
          {
            title: 'Email',
            body: businessEmail,
          },
          {
            title: 'Phone',
            body: businessPhones.join(', '),
          },
          {
            title: 'Support Topics',
            body:
              'Tour planning, booking assistance, documentation support, transport logistics, and general safari questions.',
          },
        ]),
        renderLinkList(
          'Planning Links',
          [
            { href: '/tours', label: 'Browse Safari Tours' },
            { href: '/services', label: 'Review Travel Services' },
          ],
        ),
      ],
    }),
    '/site-map': () => ({
      kind: 'static',
      schemaType: 'CollectionPage',
      path: routePath,
      title: routeMeta.title,
      heading: routeMeta.title,
      description: routeMeta.description,
      summary: routeMeta.intro,
      image: routeMeta.image,
      lead: routeMeta.intro,
      sections: [
        renderLinkList(
          'Main Pages',
          [
            { href: '/', label: 'Home' },
            { href: '/tours', label: 'Tours' },
            { href: '/services', label: 'Services' },
            { href: '/destinations', label: 'Destinations' },
            { href: '/about', label: 'About' },
            { href: '/gallery', label: 'Gallery' },
            { href: '/experiences', label: 'Experiences' },
            { href: '/contact-us', label: 'Contact Us' },
          ],
        ),
        renderLinkList(
          'All Tours',
          data.tours.map((tour) => ({
            href: `/tours/${tour.id}`,
            label: tour.title,
            meta: `${tour.duration} - ${tour.country}`,
            description: tour.summary,
          })),
        ),
        renderLinkList(
          'All Services',
          data.services.map((service) => ({
            href: `/services/${service.id}`,
            label: service.name,
            description: service.description,
          })),
        ),
        renderLinkList(
          'Destination Links',
          data.destinations.map((destination) => ({
            href: `/destinations#${destination.id}`,
            label: destination.name,
            meta: destination.region,
            description: destination.summary,
          })),
        ),
      ],
    }),
  }

  const builder = pages[routePath]
  return builder ? builder() : null
}

function buildDynamicPage(routePath, data) {
  if (routePath.startsWith('/tours/')) {
    const tourId = routePath.slice('/tours/'.length)
    const tour = data.tours.find((item) => item.id === tourId)

    if (!tour) {
      return null
    }

    const relatedTours = data.tours.filter((item) => item.id !== tour.id).slice(0, 4)

    return {
      kind: 'tour',
      schemaType: 'WebPage',
      path: routePath,
      title: `${tour.title} | ${siteName}`,
      heading: tour.title,
      description: tour.summary,
      summary: `${tour.duration} safari in ${tour.country}. ${tour.summary}`,
      image: tour.image,
      lead: `${tour.duration} safari in ${tour.country}. ${tour.summary}`,
      sections: [
        renderSummaryGrid([
          {
            title: 'Duration',
            body: tour.duration,
          },
          {
            title: 'Country',
            body: tour.country,
          },
          {
            title: 'Planning Fit',
            body:
              'Suitable for travelers comparing gorilla trekking, wildlife, and scenic route options in Uganda.',
          },
        ]),
        renderLinkList(
          'Related Tours',
          relatedTours.map((item) => ({
            href: `/tours/${item.id}`,
            label: item.title,
            meta: `${item.duration} - ${item.country}`,
            description: item.summary,
          })),
        ),
        renderLinkList('Next Steps', [
          { href: '/tours', label: 'Back To All Tours' },
          { href: '/contact-us', label: 'Request A Custom Plan' },
        ]),
      ],
    }
  }

  if (routePath.startsWith('/services/')) {
    const serviceId = routePath.slice('/services/'.length)
    const service = data.services.find((item) => item.id === serviceId)

    if (!service) {
      return null
    }

    const relatedServices = data.services.filter((item) => item.id !== service.id).slice(0, 4)

    return {
      kind: 'service',
      schemaType: 'WebPage',
      path: routePath,
      title: `${service.name} | ${siteName}`,
      heading: service.name,
      description: service.description,
      summary: service.description,
      image: service.image,
      lead: service.description,
      sections: [
        renderSummaryGrid([
          {
            title: 'Service Focus',
            body: service.description,
          },
          {
            title: 'Common Use',
            body:
              'Useful for travelers who want smoother planning, clearer logistics, and reliable on-ground coordination.',
          },
        ]),
        renderLinkList(
          'Related Services',
          relatedServices.map((item) => ({
            href: `/services/${item.id}`,
            label: item.name,
            description: item.description,
          })),
        ),
        renderLinkList('Next Steps', [
          { href: '/services', label: 'Back To All Services' },
          { href: '/contact-us', label: 'Talk To Our Team' },
        ]),
      ],
    }
  }

  return null
}

function buildFallbackPage(routePath) {
  return {
    kind: 'static',
    schemaType: 'WebPage',
    path: routePath,
    title: `${routePath === '/' ? siteName : routePath.replaceAll('/', ' ').trim()} | ${siteName}`,
    heading: routePath === '/' ? siteName : routePath,
    description: defaultDescription,
    summary: defaultDescription,
    image: '/logo.png',
    lead: defaultDescription,
    sections: [
      renderLinkList('Main Site Sections', [
        { href: '/', label: 'Home' },
        { href: '/tours', label: 'Tours' },
        { href: '/services', label: 'Services' },
        { href: '/destinations', label: 'Destinations' },
        { href: '/contact-us', label: 'Contact Us' },
      ]),
    ],
  }
}

function buildNotFoundPage(siteUrl) {
  const pagePath = '/404'

  return {
    kind: 'not-found',
    schemaType: 'WebPage',
    path: pagePath,
    title: `Page Not Found | ${siteName}`,
    heading: 'Page not found',
    description:
      'The page you requested could not be found. Browse the main safari sections or contact our team for help.',
    summary:
      'The page you requested could not be found. Browse the main safari sections or contact our team for help.',
    image: toAbsoluteUrl(siteUrl, '/images/sunset-over-mountain-ridges-0081.jpg'),
    lead:
      'The page you requested could not be found. Browse the main safari sections or contact our team for help.',
    canonicalUrl: `${siteUrl}${pagePath}`,
    noIndex: true,
    sections: [
      renderLinkList('Main Site Sections', [
        { href: '/', label: 'Home' },
        { href: '/tours', label: 'Tours' },
        { href: '/services', label: 'Services' },
        { href: '/destinations', label: 'Destinations' },
        { href: '/contact-us', label: 'Contact Us' },
      ]),
    ],
  }
}

function buildPage(routePath, data, siteUrl) {
  const basePage =
    buildStaticPage(routePath, data) ??
    buildDynamicPage(routePath, data) ??
    buildFallbackPage(routePath)
  const canonicalUrl =
    routePath === '/' ? `${siteUrl}/` : toAbsoluteUrl(siteUrl, normalizeRoutePath(routePath))

  return {
    ...basePage,
    image: toAbsoluteUrl(siteUrl, basePage.image),
    canonicalUrl,
  }
}

function renderPageBody(page, data) {
  const navigationLinks = data.navItems.map((item) => ({
    href: item.to,
    label: item.label,
  }))
  const sitemapLinks = [
    { href: '/', label: 'Home' },
    { href: '/tours', label: 'Tours' },
    { href: '/services', label: 'Services' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/about', label: 'About' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/experiences', label: 'Experiences' },
    { href: '/contact-us', label: 'Contact Us' },
    { href: '/site-map', label: 'Site Map' },
  ]

  return `
      <div class="seo-shell">
        <header class="seo-header">
          <p class="seo-eyebrow">${escapeHtml(staticPageCatalog[page.path]?.eyebrow ?? 'Safari Planning')}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="seo-lead">${escapeHtml(page.lead)}</p>
          <p class="seo-note">This route also loads the full interactive site when JavaScript is available.</p>
        </header>
        <nav class="seo-card seo-nav" aria-label="Primary">
          <h2>Main Navigation</h2>
          <ul class="seo-links">
            ${navigationLinks.map((item) => `<li>${buildLinkMarkup(item)}</li>`).join('')}
          </ul>
        </nav>
        <main class="seo-main">
          ${page.sections.join('')}
        </main>
        <footer class="seo-card seo-footer">
          <h2>Plan Your Safari</h2>
          <p>Contact ${escapeHtml(siteName)} at <a href="mailto:${escapeHtml(
            businessEmail,
          )}">${escapeHtml(businessEmail)}</a> or call ${escapeHtml(businessPhones[0])}.</p>
          <ul class="seo-links">
            ${sitemapLinks.map((item) => `<li>${buildLinkMarkup(item)}</li>`).join('')}
          </ul>
        </footer>
      </div>
    `
}

function buildHtmlDocument(page, structuredDataJson, assetTags, data) {
  const robotsDirective = page.noIndex
    ? 'noindex,nofollow,noarchive,max-image-preview:none'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  const seoImageAlt = buildSeoImageAlt(page)
  const structuredDataScript = structuredDataJson
    ? `    <script type="application/ld+json">${structuredDataJson}</script>\n`
    : ''

  return `<!doctype html>
<html lang="${siteLanguage}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="author" content="${escapeHtml(siteName)}" />
    <meta name="robots" content="${robotsDirective}" />
    <meta name="googlebot" content="${robotsDirective}" />
    <meta name="theme-color" content="#0f2013" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:type" content="${page.kind === 'tour' || page.kind === 'service' ? 'article' : 'website'}" />
    <meta property="og:url" content="${escapeHtml(page.canonicalUrl)}" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:locale" content="${siteLocale}" />
    <meta property="og:image" content="${escapeHtml(page.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(page.image)}" />
    <meta property="og:image:alt" content="${escapeHtml(seoImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(page.image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(seoImageAlt)}" />
    <meta name="twitter:url" content="${escapeHtml(page.canonicalUrl)}" />
    <link rel="canonical" href="${escapeHtml(page.canonicalUrl)}" />
    <link rel="preconnect" href="https://upload.wikimedia.org" crossorigin />
    <title>${escapeHtml(page.title)}</title>
    <style>
      :root {
        color-scheme: light;
        --seo-bg: #f7f4eb;
        --seo-card: rgba(255, 255, 255, 0.92);
        --seo-ink: #183320;
        --seo-muted: #5a6a5f;
        --seo-line: rgba(24, 51, 32, 0.12);
        --seo-link: #0f6a40;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background:
          radial-gradient(circle at top, rgba(196, 232, 194, 0.25), transparent 34%),
          linear-gradient(180deg, #fbfaf5 0%, var(--seo-bg) 100%);
        color: var(--seo-ink);
        font-family: Georgia, "Times New Roman", serif;
        line-height: 1.6;
      }

      a {
        color: var(--seo-link);
      }

      .seo-shell {
        max-width: 1024px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }

      .seo-header {
        margin-bottom: 24px;
      }

      .seo-eyebrow {
        margin: 0 0 8px;
        color: var(--seo-muted);
        font-size: 0.88rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .seo-header h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.05;
      }

      .seo-lead,
      .seo-note {
        max-width: 760px;
      }

      .seo-note {
        color: var(--seo-muted);
        font-size: 0.95rem;
      }

      .seo-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .seo-card {
        margin-bottom: 18px;
        padding: 18px;
        border: 1px solid var(--seo-line);
        border-radius: 18px;
        background: var(--seo-card);
        box-shadow: 0 18px 40px rgba(24, 51, 32, 0.06);
      }

      .seo-card h2 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 1.15rem;
      }

      .seo-links,
      .seo-list {
        margin: 0;
        padding-left: 20px;
      }

      .seo-links li + li,
      .seo-list li + li {
        margin-top: 10px;
      }

      .seo-list strong {
        display: inline-block;
        margin-right: 8px;
      }

      .seo-list span {
        color: var(--seo-muted);
        font-size: 0.92rem;
      }

      .seo-list p {
        margin: 6px 0 0;
      }
    </style>
${structuredDataScript}
    ${assetTags}
  </head>
  <body>
    <div id="root">${renderPageBody(page, data)}</div>
  </body>
</html>
`
}

function writeRouteHtml(routePath, html) {
  if (routePath === '/') {
    fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8')
    return
  }

  const outputDirectory = path.join(distDir, routePath.replace(/^\/+/, ''))
  fs.mkdirSync(outputDirectory, { recursive: true })
  fs.writeFileSync(path.join(outputDirectory, 'index.html'), html, 'utf8')
}

function write404Html(html) {
  fs.writeFileSync(path.join(distDir, '404.html'), html, 'utf8')
}

function getCanonicalRedirectLines(siteUrl) {
  const site = new URL(siteUrl)
  const canonicalHttpsOrigin = new URL(`https://${site.host}`).origin
  const alternateHost = site.host.startsWith('www.') ? site.host.slice(4) : `www.${site.host}`
  const redirectLines = [`http://${site.host}/* ${canonicalHttpsOrigin}/:splat 301!`]

  if (alternateHost !== site.host) {
    redirectLines.push(`http://${alternateHost}/* ${canonicalHttpsOrigin}/:splat 301!`)
    redirectLines.push(`https://${alternateHost}/* ${canonicalHttpsOrigin}/:splat 301!`)
  }

  return [...new Set(redirectLines)]
}

function writeNetlifyRedirects(siteUrl) {
  const redirectLines = [...getCanonicalRedirectLines(siteUrl), '/legacy-source.html / 301', '/home / 301']
  fs.writeFileSync(path.join(distDir, '_redirects'), `${redirectLines.join('\n')}\n`, 'utf8')
}

function run() {
  if (!fs.existsSync(distDir)) {
    throw new Error('[seo] dist directory not found. Run the build before prerendering routes.')
  }

  const siteUrl = getSiteUrl()
  const data = loadSiteContentData()
  const routePaths = readSitemapRoutes(siteUrl)
  const templateHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
  const assetTags = extractAssetTags(templateHtml)

  routePaths.forEach((routePath) => {
    const page = buildPage(routePath, data, siteUrl)
    const structuredDataJson = JSON.stringify(buildStructuredData(siteUrl, page))
    const html = buildHtmlDocument(page, structuredDataJson, assetTags, data)
    writeRouteHtml(routePath, html)
  })

  const notFoundPage = buildNotFoundPage(siteUrl)
  const notFoundHtml = buildHtmlDocument(notFoundPage, null, assetTags, data)
  write404Html(notFoundHtml)

  writeNetlifyRedirects(siteUrl)

  console.log(`[seo] Prerendered ${routePaths.length} crawlable routes with route-specific HTML.`)
}

run()
