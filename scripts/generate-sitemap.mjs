import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const publicDir = path.join(projectRoot, 'public')
const publicImagesDir = path.join(publicDir, 'images')
const siteContentPath = path.join(projectRoot, 'src', 'data', 'siteContent.ts')

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
    'https://kigeziwildlifevacationsafaris.com'
  ).trim()

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`
  const normalizedUrl = new URL(withProtocol)

  if (!envFromFiles.VITE_SITE_URL && !process.env.VITE_SITE_URL) {
    console.warn(
      '[seo] VITE_SITE_URL is not set. Sitemap/robots will use a fallback URL. Set VITE_SITE_URL in .env for production.',
    )
  }

  return normalizedUrl.origin.replace(/\/+$/, '')
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
globalThis.__SEO_ROUTE_DATA__ = { tours, services };`,
    context,
  )

  return context.__SEO_ROUTE_DATA__
}

function getRoutePriority(routePath) {
  if (routePath === '/') {
    return '1.0'
  }

  if (routePath === '/tours' || routePath === '/services' || routePath === '/destinations') {
    return '0.9'
  }

  if (routePath.startsWith('/tours/') || routePath.startsWith('/services/')) {
    return '0.8'
  }

  return '0.7'
}

function getRouteChangeFrequency(routePath) {
  if (routePath === '/') {
    return 'weekly'
  }

  if (
    routePath === '/tours' ||
    routePath === '/services' ||
    routePath.startsWith('/tours/') ||
    routePath.startsWith('/services/')
  ) {
    return 'weekly'
  }

  return 'monthly'
}

function generateSitemapXml(siteUrl, routes) {
  const lastModified = new Date().toISOString()
  const urlEntries = routes
    .map((routePath) => {
      const routeUrl = `${siteUrl}${routePath}`
      const priority = getRoutePriority(routePath)
      const changeFrequency = getRouteChangeFrequency(routePath)

      return [
        '  <url>',
        `    <loc>${routeUrl}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n')
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function isImageFile(fileName) {
  return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(fileName)
}

function collectImagePaths(directory, basePathPrefix) {
  if (!fs.existsSync(directory)) {
    return []
  }

  const output = []
  const stack = [{ directory, relativePath: '' }]

  while (stack.length > 0) {
    const current = stack.pop()

    if (!current) {
      continue
    }

    const entries = fs.readdirSync(current.directory, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        stack.push({
          directory: path.join(current.directory, entry.name),
          relativePath: path.join(current.relativePath, entry.name),
        })
        continue
      }

      if (!isImageFile(entry.name)) {
        continue
      }

      const webPath = path.posix.join(
        basePathPrefix,
        current.relativePath.replaceAll('\\', '/'),
        entry.name,
      )
      output.push(`/${webPath.replace(/^\/+/, '')}`)
    }
  }

  return output
}

function generateImageSitemapXml(siteUrl, imageEntries) {
  const groupedImagesByPage = imageEntries.reduce((accumulator, entry) => {
    const pagePath = entry.pagePath
    const imagePath = entry.imagePath

    if (!accumulator.has(pagePath)) {
      accumulator.set(pagePath, new Set())
    }

    accumulator.get(pagePath).add(imagePath)
    return accumulator
  }, new Map())

  const urlEntries = [...groupedImagesByPage.entries()]
    .map(([pagePath, imagePaths]) => {
      const pageUrl = `${siteUrl}${pagePath}`
      const imageEntriesForPage = [...imagePaths]
        .map((imagePath) => `    <image:image>\n      <image:loc>${escapeXml(`${siteUrl}${imagePath}`)}</image:loc>\n    </image:image>`)
        .join('\n')

      return [
        '  <url>',
        `    <loc>${escapeXml(pageUrl)}</loc>`,
        imageEntriesForPage,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n')
}

function generateRobotsTxt(siteUrl) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    `Sitemap: ${siteUrl}/sitemap-images.xml`,
    '',
  ].join('\n')
}

function run() {
  const siteUrl = getSiteUrl()
  const siteContentData = loadSiteContentData()
  const tourIds = (Array.isArray(siteContentData?.tours) ? siteContentData.tours : [])
    .map((tour) => (typeof tour?.id === 'string' ? tour.id.trim() : ''))
    .filter(Boolean)
  const serviceIds = (Array.isArray(siteContentData?.services) ? siteContentData.services : [])
    .map((service) => (typeof service?.id === 'string' ? service.id.trim() : ''))
    .filter(Boolean)
  const staticRoutes = [
    '/',
    '/tours',
    '/services',
    '/destinations',
    '/about',
    '/gallery',
    '/experiences',
    '/contact-us',
    '/site-map',
  ]
  const tourRoutes = tourIds.map((tourId) => `/tours/${tourId}`)
  const serviceRoutes = serviceIds.map((serviceId) => `/services/${serviceId}`)
  const allRoutes = [...new Set([...staticRoutes, ...tourRoutes, ...serviceRoutes])]
  const sitemapXml = generateSitemapXml(siteUrl, allRoutes)
  const imagePaths = collectImagePaths(publicImagesDir, 'images')
  const imageEntries = [
    { pagePath: '/', imagePath: '/logo.png' },
    ...imagePaths.map((imagePath) => ({
      pagePath: '/gallery',
      imagePath,
    })),
  ]
  const imageSitemapXml = generateImageSitemapXml(siteUrl, imageEntries)
  const robotsTxt = generateRobotsTxt(siteUrl)

  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8')
  fs.writeFileSync(path.join(publicDir, 'sitemap-images.xml'), imageSitemapXml, 'utf8')
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8')

  console.log(
    `[seo] Generated sitemap.xml (${allRoutes.length} URLs), sitemap-images.xml (${imageEntries.length} images), and robots.txt for ${siteUrl}`,
  )
}

run()
