import { startTransition, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  supportedLanguageCodes,
  translations,
  type SupportedLanguageCode,
  type TranslationDictionary,
  type TranslationKey,
} from '../i18n/translations'
import { translateRuntimeText, warmRuntimeTranslations } from '../i18n/runtimeTranslator'
import { TranslationContext, type TranslationContextValue } from './translation-context'

const regionalLanguageByCountry: Record<string, SupportedLanguageCode> = {
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  MC: 'fr',
  LU: 'fr',
  DE: 'de',
  AT: 'de',
  LI: 'de',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  UY: 'es',
  PY: 'es',
  BO: 'es',
  EC: 'es',
  GT: 'es',
  CR: 'es',
  PA: 'es',
  DO: 'es',
  SV: 'es',
  HN: 'es',
  NI: 'es',
  PR: 'es',
  IT: 'it',
  SM: 'it',
  VA: 'it',
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',
  PT: 'pt',
  BR: 'pt',
  AO: 'pt',
  MZ: 'pt',
}

const languageStorageKey = 'awv-language'
const supportedLanguageSet = new Set<SupportedLanguageCode>(supportedLanguageCodes)
const locationLookupTimeoutMs = 3200

function normalizeLanguage(input: string | null | undefined): SupportedLanguageCode | null {
  if (!input) {
    return null
  }

  const lowered = input.toLowerCase()
  const direct = lowered as SupportedLanguageCode

  if (supportedLanguageSet.has(direct)) {
    return direct
  }

  const base = lowered.split('-')[0] as SupportedLanguageCode
  return supportedLanguageSet.has(base) ? base : null
}

function extractRegion(input: string | null | undefined): string | null {
  if (!input || !input.includes('-')) {
    return null
  }

  const [, region] = input.split('-')
  return region ? region.toUpperCase() : null
}

function detectLanguageByRegion(): SupportedLanguageCode {
  const browserLocales = [...navigator.languages, navigator.language]
  let fallback: SupportedLanguageCode = 'en'

  for (const locale of browserLocales) {
    const normalized = normalizeLanguage(locale)

    if (normalized && normalized !== 'en') {
      return normalized
    }

    const region = extractRegion(locale)

    if (region && regionalLanguageByCountry[region]) {
      return regionalLanguageByCountry[region]
    }

    if (normalized === 'en') {
      fallback = 'en'
    }
  }

  return fallback
}

function detectLanguageByLocaleCountry(): SupportedLanguageCode | null {
  const browserLocales = [...navigator.languages, navigator.language]

  for (const locale of browserLocales) {
    const region = extractRegion(locale)

    if (region && regionalLanguageByCountry[region]) {
      return regionalLanguageByCountry[region]
    }
  }

  return null
}

function getSavedLanguage(): SupportedLanguageCode | null {
  return normalizeLanguage(localStorage.getItem(languageStorageKey))
}

function getInitialLanguage(): SupportedLanguageCode {
  const saved = getSavedLanguage()
  return saved ?? detectLanguageByRegion()
}

async function fetchCountryCodeFromLocationApi(): Promise<string | null> {
  const endpoints = [
    {
      url: 'https://ipapi.co/country/',
      parse: async (response: Response) => response.text(),
    },
    {
      url: 'https://ipwho.is/',
      parse: async (response: Response) => {
        const payload = (await response.json()) as { country_code?: string; success?: boolean }

        if (payload.success === false) {
          return ''
        }

        return payload.country_code ?? ''
      },
    },
  ] as const

  for (const endpoint of endpoints) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), locationLookupTimeoutMs)

    try {
      const response = await fetch(endpoint.url, { signal: controller.signal })

      if (!response.ok) {
        continue
      }

      const rawCountryCode = (await endpoint.parse(response)).trim().toUpperCase()

      if (/^[A-Z]{2}$/.test(rawCountryCode)) {
        return rawCountryCode
      }
    } catch {
      // Try the next provider.
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  return null
}

async function detectLanguageByLocation(): Promise<SupportedLanguageCode | null> {
  const localeCountryLanguage = detectLanguageByLocaleCountry()

  if (localeCountryLanguage) {
    return localeCountryLanguage
  }

  const countryCode = await fetchCountryCodeFromLocationApi()

  if (!countryCode) {
    return null
  }

  return regionalLanguageByCountry[countryCode] ?? null
}

function shouldAutoTranslateUiValue(value: string): boolean {
  const normalized = value.trim()

  if (!normalized) {
    return false
  }

  if (normalized.includes('@')) {
    return false
  }

  if (/^https?:\/\//i.test(normalized)) {
    return false
  }

  if (/^\+?[\d\s().-]+$/.test(normalized)) {
    return false
  }

  return /[a-zA-Z]/.test(normalized)
}

type RuntimeDictionaryState = {
  language: SupportedLanguageCode
  values: Partial<TranslationDictionary>
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => getInitialLanguage())
  const [runtimeDictionaryState, setRuntimeDictionaryState] = useState<RuntimeDictionaryState>({
    language: 'en',
    values: {},
  })

  const setLanguage = (nextLanguage: SupportedLanguageCode) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage) ?? 'en'
    startTransition(() => {
      setLanguageState(normalizedLanguage)
    })
    localStorage.setItem(languageStorageKey, normalizedLanguage)
  }

  useEffect(() => {
    let timeoutId: number | null = null
    let idleRequestId: number | null = null
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleRequestId = idleWindow.requestIdleCallback(() => {
        warmRuntimeTranslations()
      }, { timeout: 5000 })
    } else {
      timeoutId = window.setTimeout(() => {
        warmRuntimeTranslations()
      }, 1800)
    }

    return () => {
      if (idleRequestId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleRequestId)
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    if (language === 'en') {
      return
    }

    let timeoutId: number | null = null
    let idleRequestId: number | null = null
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleRequestId = idleWindow.requestIdleCallback(() => {
        warmRuntimeTranslations({ preloadStaticTranslations: true })
      }, { timeout: 5000 })
    } else {
      timeoutId = window.setTimeout(() => {
        warmRuntimeTranslations({ preloadStaticTranslations: true })
      }, 1500)
    }

    return () => {
      if (idleRequestId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleRequestId)
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [language])

  useEffect(() => {
    const savedLanguage = getSavedLanguage()

    if (savedLanguage) {
      return
    }

    let isActive = true

    const run = async () => {
      const locationLanguage = await detectLanguageByLocation()

      if (!isActive || !locationLanguage) {
        return
      }

      setLanguageState((current) => {
        if (current === locationLanguage) {
          return current
        }

        localStorage.setItem(languageStorageKey, locationLanguage)
        return locationLanguage
      })
    }

    let timeoutId: number | null = null
    let idleRequestId: number | null = null
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleRequestId = idleWindow.requestIdleCallback(() => {
        void run()
      }, { timeout: 3000 })
    } else {
      timeoutId = window.setTimeout(() => {
        void run()
      }, 1200)
    }

    return () => {
      isActive = false

      if (idleRequestId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleRequestId)
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    if (language === 'en') {
      return
    }

    let isActive = true
    const englishDictionary = translations.en
    const selectedDictionary = translations[language]
    const allKeys = Object.keys(englishDictionary) as TranslationKey[]
    const keysToTranslate = allKeys.filter((key) => {
      const englishValue = englishDictionary[key]
      const selectedValue = selectedDictionary[key]

      if (selectedValue !== englishValue) {
        return false
      }

      return shouldAutoTranslateUiValue(englishValue)
    })

    const batchSize = 8

    const run = async () => {
      const runtimeValues: Partial<TranslationDictionary> = {}

      for (let index = 0; index < keysToTranslate.length; index += batchSize) {
        const batch = keysToTranslate.slice(index, index + batchSize)
        const batchResults = await Promise.all(
          batch.map(async (key) => [key, await translateRuntimeText(englishDictionary[key], language)] as const),
        )

        if (!isActive) {
          return
        }

        for (const [key, translatedValue] of batchResults) {
          if (translatedValue && translatedValue !== englishDictionary[key]) {
            runtimeValues[key] = translatedValue
          }
        }

        if (index + batchSize < keysToTranslate.length) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, 0)
          })
        }
      }

      if (isActive) {
        startTransition(() => {
          setRuntimeDictionaryState({
            language,
            values: runtimeValues,
          })
        })
      }
    }

    void run()

    return () => {
      isActive = false
    }
  }, [language])

  const value = useMemo<TranslationContextValue>(() => {
    const runtimeValues =
      runtimeDictionaryState.language === language ? runtimeDictionaryState.values : {}
    const t = (key: TranslationKey) =>
      runtimeValues[key] ?? translations[language][key] ?? translations.en[key]

    return {
      language,
      setLanguage,
      t,
    }
  }, [language, runtimeDictionaryState])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
