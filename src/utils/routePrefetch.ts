const prefetchedRoutes = new Set<string>()

const routePreloaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/HomePage'),
  '/tours': () => import('../pages/ToursPage'),
  '/tours/:tourId': () => import('../pages/TourDetailPage'),
  '/services': () => import('../pages/ServicesPage'),
  '/services/:serviceId': () => import('../pages/ServiceDetailPage'),
  '/destinations': () => import('../pages/DestinationsPage'),
  '/about': () => import('../pages/AboutPage'),
  '/gallery': () => import('../pages/GalleryPage'),
  '/experiences': () => import('../pages/ExperiencesPage'),
  '/contact-us': () => import('../pages/ContactPage'),
  '/404': () => import('../pages/NotFoundPage'),
}

function normalizePrefetchTarget(path: string): string | null {
  if (!path || /^https?:\/\//i.test(path)) {
    return null
  }

  const [pathWithoutHash] = path.split('#')
  const [pathname] = pathWithoutHash.split('?')
  const normalized = pathname && pathname !== '' ? pathname : '/'

  if (normalized.startsWith('/tours/') && normalized !== '/tours') {
    return '/tours/:tourId'
  }

  if (normalized.startsWith('/services/') && normalized !== '/services') {
    return '/services/:serviceId'
  }

  return normalized
}

export function prefetchRoute(path: string) {
  const normalizedPath = normalizePrefetchTarget(path)

  if (!normalizedPath || prefetchedRoutes.has(normalizedPath)) {
    return
  }

  const preloader = routePreloaders[normalizedPath]

  if (!preloader) {
    return
  }

  prefetchedRoutes.add(normalizedPath)
  void preloader().catch(() => {
    prefetchedRoutes.delete(normalizedPath)
  })
}
