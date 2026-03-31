import type { SupportedLanguageCode } from './translations'

const translationCache = new Map<string, string>()
const inFlightTranslations = new Map<string, Promise<string>>()
const translationStorageKey = 'awv-runtime-translation-cache-v3'
let persistTimer: number | null = null
let hasLoadedPersistentCache = false
let activeProviderRequests = 0
const maxConcurrentProviderRequests = 4
const providerQueue: Array<() => void> = []
const LIST_BREAK_TOKEN = '__AWV_LIST_BREAK__'
const LIST_SEPARATOR = `\n${LIST_BREAK_TOKEN}\n`
const MAX_BATCH_CHARACTERS = 900

type StaticRuntimeTranslationsMap = Partial<Record<SupportedLanguageCode, Record<string, string>>>
let staticRuntimeTranslationsCache: StaticRuntimeTranslationsMap | null = null
let staticRuntimeTranslationsPromise: Promise<StaticRuntimeTranslationsMap> | null = null

const targetLanguageByCode: Record<SupportedLanguageCode, string> = {
  en: 'en',
  fr: 'fr',
  de: 'de',
  es: 'es',
  it: 'it',
  ru: 'ru',
  pt: 'pt',
}

const requestTimeoutMs = 4500
const protectedTerms = [
  LIST_BREAK_TOKEN,
  'Bigodi Wetland Sanctuary, Uganda',
  'Bwindi Impenetrable National Park, Uganda',
  'Entebbe, Uganda',
  'Fort Portal, Uganda',
  'Ishasha Sector, Queen Elizabeth National Park, Uganda',
  'Jinja, Uganda',
  'Kampala, Uganda',
  'Kazinga Channel, Uganda',
  'Kibale National Park, Uganda',
  'Kidepo Valley National Park, Uganda',
  'Kisoro, Uganda',
  'Lake Bunyonyi, Uganda',
  'Lake Mburo National Park, Uganda',
  'Mgahinga Gorilla National Park, Uganda',
  'Murchison Falls National Park, Uganda',
  'Queen Elizabeth National Park, Uganda',
  'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
  'Rwenzori Mountains National Park, Uganda',
  'Semuliki National Park, Uganda',
  'Sipi Falls, Uganda',
  'Ziwa Rhino Sanctuary, Uganda',
  'Bwindi Impenetrable National Park',
  'Murchison Falls National Park',
  'Queen Elizabeth National Park',
  'Kidepo Valley National Park',
  'Rwenzori Mountains National Park',
  'Lake Mburo National Park',
  'Mgahinga Gorilla National Park',
  'Ziwa Rhino Sanctuary',
  'Bigodi Wetland Sanctuary',
  'Bigodi wetland',
  'Kazinga Channel',
  'Ishasha Sector',
  'Semuliki National Park',
  'Lake Bunyonyi',
  'Lake Mburo',
  'Lake Victoria',
  'Murchison Falls',
  'Queen Elizabeth',
  'Source of the Nile',
  'Rushaga Sector',
  'Fort Portal',
  'Kibale National Park',
  'Kibale',
  'Bwindi',
  'Kidepo',
  'Sipi Falls',
  'Entebbe',
  'Kampala',
  'Jinja',
  'Kisoro',
  'Mgahinga',
  'Semuliki',
  'Rwenzori',
  'Ishasha',
  'Kazinga',
  'Nile',
  'OpenStreetMap',
  'Nominatim',
  'Batwa',
  'Uganda',
  'Kigezi',
  'Kanada Suvati',
  'Atwijuka Kevin',
] as const
const protectedTermsSorted = [...protectedTerms].sort((a, b) => b.length - a.length)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeProtectedTerms(value: string): string {
  let normalized = value

  for (const term of protectedTermsSorted) {
    normalized = normalized.replace(new RegExp(escapeRegExp(term), 'gi'), term)
  }

  return normalized
}

function protectProtectedTerms(value: string): string {
  let protectedValue = value

  for (let index = 0; index < protectedTermsSorted.length; index += 1) {
    const term = protectedTermsSorted[index]
    const placeholder = `__PROTECTED_TERM_${index}__`
    protectedValue = protectedValue.replace(new RegExp(escapeRegExp(term), 'gi'), placeholder)
  }

  return protectedValue
}

function restoreProtectedTerms(value: string): string {
  let restored = value

  for (let index = 0; index < protectedTermsSorted.length; index += 1) {
    const term = protectedTermsSorted[index]
    const placeholder = `__PROTECTED_TERM_${index}__`
    restored = restored.replaceAll(placeholder, term)
  }

  return normalizeProtectedTerms(restored)
}

function isTranslatableText(value: string): boolean {
  const normalized = value.trim()

  if (!normalized) {
    return false
  }

  if (/^https?:\/\//i.test(normalized)) {
    return false
  }

  if (normalized.includes('@')) {
    return false
  }

  if (/^\+?[\d\s().-]+$/.test(normalized)) {
    return false
  }

  return /[a-zA-Z]/.test(normalized)
}

function buildCacheKey(text: string, language: SupportedLanguageCode): string {
  return `${language}::${text}`
}

function readPersistentCache(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(translationStorageKey)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function ensurePersistentCacheLoaded() {
  if (hasLoadedPersistentCache || typeof window === 'undefined') {
    return
  }

  for (const [cacheKey, cachedValue] of Object.entries(readPersistentCache())) {
    translationCache.set(cacheKey, cachedValue)
  }

  hasLoadedPersistentCache = true
}

function schedulePersistCache() {
  if (typeof window === 'undefined') {
    return
  }

  if (persistTimer !== null) {
    window.clearTimeout(persistTimer)
  }

  persistTimer = window.setTimeout(() => {
    try {
      const serializableCache = Object.fromEntries(translationCache.entries())
      window.localStorage.setItem(translationStorageKey, JSON.stringify(serializableCache))
    } catch {
      // Ignore storage errors.
    }
  }, 250)
}

async function getStaticRuntimeTranslations(): Promise<StaticRuntimeTranslationsMap> {
  if (staticRuntimeTranslationsCache) {
    return staticRuntimeTranslationsCache
  }

  if (!staticRuntimeTranslationsPromise) {
    staticRuntimeTranslationsPromise = import('./staticRuntimeTranslations')
      .then((module) => {
        staticRuntimeTranslationsCache = module.staticRuntimeTranslations
        return staticRuntimeTranslationsCache
      })
      .catch(() => {
        staticRuntimeTranslationsCache = {}
        return staticRuntimeTranslationsCache
      })
  }

  return staticRuntimeTranslationsPromise
}

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function translateViaMyMemory(text: string, targetLanguage: string): Promise<string | null> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(targetLanguage)}`
  const response = await fetchWithTimeout(url)

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as {
    responseData?: { translatedText?: string }
    responseDetails?: string
  }
  const details = payload.responseDetails?.toLowerCase() ?? ''
  const translated = payload.responseData?.translatedText?.trim() ?? ''

  if (
    details.includes('mymemory warning') ||
    details.includes('quota') ||
    details.includes('limit') ||
    translated.toLowerCase().includes('mymemory warning')
  ) {
    return null
  }

  if (!translated || translated === text) {
    return null
  }

  return translated
}

async function translateViaLibreTranslate(
  text: string,
  targetLanguage: string,
): Promise<string | null> {
  const endpoints = [
    'https://translate.argosopentech.com/translate',
    'https://libretranslate.de/translate',
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLanguage,
          format: 'text',
        }),
      })

      if (!response.ok) {
        continue
      }

      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        continue
      }

      const payload = (await response.json()) as { translatedText?: string }
      const translated = payload.translatedText?.trim() ?? ''

      if (translated && translated !== text) {
        return translated
      }
    } catch {
      // Continue to next provider endpoint.
    }
  }

  return null
}

async function translateViaGoogleLite(
  text: string,
  targetLanguage: string,
): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
    targetLanguage,
  )}&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetchWithTimeout(url)

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as Array<Array<[string, string]>> | null
  const segments = payload?.[0]

  if (!Array.isArray(segments)) {
    return null
  }

  const translated = segments.map((segment) => segment?.[0]).filter(Boolean).join('').trim()

  if (!translated || translated === text) {
    return null
  }

  return translated
}

async function runProviders(text: string, targetLanguage: string): Promise<string> {
  try {
    const myMemoryResult = await translateViaMyMemory(text, targetLanguage)

    if (myMemoryResult) {
      return myMemoryResult
    }
  } catch {
    // Fall through to next provider.
  }

  try {
    const libreTranslateResult = await translateViaLibreTranslate(text, targetLanguage)

    if (libreTranslateResult) {
      return libreTranslateResult
    }
  } catch {
    // Ignore and return original text.
  }

  try {
    const googleLiteResult = await translateViaGoogleLite(text, targetLanguage)

    if (googleLiteResult) {
      return googleLiteResult
    }
  } catch {
    // Ignore and return original text.
  }

  return text
}

function runProvidersWithConcurrencyLimit(text: string, targetLanguage: string): Promise<string> {
  return new Promise((resolve) => {
    const start = () => {
      activeProviderRequests += 1
      void runProviders(text, targetLanguage)
        .then(resolve)
        .catch(() => resolve(text))
        .finally(() => {
          activeProviderRequests -= 1
          const next = providerQueue.shift()

          if (next) {
            next()
          }
        })
    }

    if (activeProviderRequests < maxConcurrentProviderRequests) {
      start()
      return
    }

    providerQueue.push(start)
  })
}

async function translateBatch(
  items: readonly string[],
  language: SupportedLanguageCode,
): Promise<string[] | null> {
  const targetLanguage = targetLanguageByCode[language]
  const joined = items.join(LIST_SEPARATOR)
  const translated = await runProvidersWithConcurrencyLimit(protectProtectedTerms(joined), targetLanguage)
  const restored = restoreProtectedTerms(translated || joined)
  const parts = restored.split(LIST_BREAK_TOKEN)

  if (parts.length !== items.length) {
    return null
  }

  return parts.map((part) => part.trim())
}

export async function translateRuntimeText(
  text: string,
  language: SupportedLanguageCode,
): Promise<string> {
  const normalizedInput = normalizeProtectedTerms(text)

  if (language === 'en' || !isTranslatableText(normalizedInput)) {
    return normalizedInput
  }

  ensurePersistentCacheLoaded()

  const targetLanguage = targetLanguageByCode[language]
  const cacheKey = buildCacheKey(normalizedInput, language)
  const cached = translationCache.get(cacheKey)

  if (cached) {
    return restoreProtectedTerms(cached)
  }

  const staticRuntimeTranslations = await getStaticRuntimeTranslations()
  const staticTranslation = staticRuntimeTranslations[language]?.[normalizedInput]

  if (staticTranslation) {
    const finalStaticValue = restoreProtectedTerms(staticTranslation)
    translationCache.set(cacheKey, finalStaticValue)
    return finalStaticValue
  }

  const activeRequest = inFlightTranslations.get(cacheKey)

  if (activeRequest) {
    return activeRequest
  }

  const request = runProvidersWithConcurrencyLimit(protectProtectedTerms(normalizedInput), targetLanguage)
    .then((translated) => {
      const finalValue = restoreProtectedTerms(translated || normalizedInput)
      translationCache.set(cacheKey, finalValue)
      schedulePersistCache()
      return finalValue
    })
    .catch(() => normalizedInput)
    .finally(() => {
      inFlightTranslations.delete(cacheKey)
    })

  inFlightTranslations.set(cacheKey, request)

  return request
}

type WarmRuntimeTranslationsOptions = {
  preloadStaticTranslations?: boolean
}

export function warmRuntimeTranslations(options: WarmRuntimeTranslationsOptions = {}) {
  ensurePersistentCacheLoaded()

  if (options.preloadStaticTranslations) {
    void getStaticRuntimeTranslations()
  }
}

export function getCachedRuntimeTranslation(
  text: string,
  language: SupportedLanguageCode,
): string | null {
  if (language === 'en') {
    return text
  }

  ensurePersistentCacheLoaded()
  const normalized = normalizeProtectedTerms(text)

  if (!isTranslatableText(normalized)) {
    return normalized
  }

  const cacheKey = buildCacheKey(normalized, language)
  const cached = translationCache.get(cacheKey)

  if (cached) {
    return restoreProtectedTerms(cached)
  }

  const staticTranslation = staticRuntimeTranslationsCache?.[language]?.[normalized]
  if (staticTranslation) {
    return restoreProtectedTerms(staticTranslation)
  }

  return null
}

export function getCachedRuntimeTranslations(
  items: readonly string[],
  language: SupportedLanguageCode,
): string[] {
  if (language === 'en') {
    return [...items]
  }

  ensurePersistentCacheLoaded()
  const staticTranslationsForLanguage = staticRuntimeTranslationsCache?.[language] ?? {}

  return items.map((item) => {
    const normalized = normalizeProtectedTerms(item)

    if (!isTranslatableText(normalized)) {
      return normalized
    }

    const cacheKey = buildCacheKey(normalized, language)
    const cached = translationCache.get(cacheKey)

    if (cached) {
      return restoreProtectedTerms(cached)
    }

    const staticTranslation = staticTranslationsForLanguage[normalized]
    if (staticTranslation) {
      return restoreProtectedTerms(staticTranslation)
    }

    return item
  })
}

export async function translateRuntimeList(
  items: readonly string[],
  language: SupportedLanguageCode,
): Promise<string[]> {
  if (language === 'en') {
    return [...items]
  }

  ensurePersistentCacheLoaded()

  const staticRuntimeTranslations = await getStaticRuntimeTranslations()
  const staticTranslationsForLanguage = staticRuntimeTranslations[language] ?? {}
  const resolved: string[] = new Array(items.length)
  const pending: Array<{ index: number; source: string }> = []
  let didCacheUpdate = false

  items.forEach((item, index) => {
    const normalized = normalizeProtectedTerms(item)

    if (!isTranslatableText(normalized)) {
      resolved[index] = normalized
      return
    }

    const cacheKey = buildCacheKey(normalized, language)
    const cached = translationCache.get(cacheKey)

    if (cached) {
      resolved[index] = restoreProtectedTerms(cached)
      return
    }

    const staticTranslation = staticTranslationsForLanguage[normalized]

    if (staticTranslation) {
      const finalValue = restoreProtectedTerms(staticTranslation)
      translationCache.set(cacheKey, finalValue)
      didCacheUpdate = true
      resolved[index] = finalValue
      return
    }

    pending.push({ index, source: normalized })
  })

  if (pending.length === 0) {
    if (didCacheUpdate) {
      schedulePersistCache()
    }

    return resolved
  }

  const batches: Array<Array<{ index: number; source: string }>> = []
  let current: Array<{ index: number; source: string }> = []
  let currentLength = 0

  for (const item of pending) {
    const projectedLength = currentLength + item.source.length + LIST_SEPARATOR.length
    if (current.length > 0 && projectedLength > MAX_BATCH_CHARACTERS) {
      batches.push(current)
      current = []
      currentLength = 0
    }

    current.push(item)
    currentLength += item.source.length + LIST_SEPARATOR.length
  }

  if (current.length) {
    batches.push(current)
  }

  for (const batch of batches) {
    if (batch.length === 1) {
      const translated = await translateRuntimeText(batch[0].source, language)
      resolved[batch[0].index] = translated
      if (translated !== batch[0].source) {
        didCacheUpdate = true
      }
      continue
    }

    const translatedBatch = await translateBatch(
      batch.map((item) => item.source),
      language,
    )

    if (translatedBatch && translatedBatch.length === batch.length) {
      translatedBatch.forEach((translatedValue, index) => {
        const source = batch[index].source
        const finalValue = translatedValue || source
        resolved[batch[index].index] = finalValue
        translationCache.set(buildCacheKey(source, language), finalValue)
        didCacheUpdate = true
      })
      continue
    }

    const fallbackTranslations = await Promise.all(
      batch.map((item) => translateRuntimeText(item.source, language)),
    )

    fallbackTranslations.forEach((translatedValue, index) => {
      resolved[batch[index].index] = translatedValue
      if (translatedValue !== batch[index].source) {
        didCacheUpdate = true
      }
    })
  }

  if (didCacheUpdate) {
    schedulePersistCache()
  }

  return resolved
}
