const INDEXABLE_SERVICE_IDS = new Set([
  'airport-transfers',
  'permit-processing',
  'accommodation-booking',
  'tour-package-planning',
  'car-rental-services',
  'tour-guide-services',
  'consultation-itinerary',
])

export function isIndexableServiceId(serviceId: string | null | undefined): boolean {
  return typeof serviceId === 'string' && INDEXABLE_SERVICE_IDS.has(serviceId.trim())
}

export function getIndexableServiceIds(): string[] {
  return [...INDEXABLE_SERVICE_IDS]
}
