import { createContext } from 'react'
import type { SupportedLanguageCode, TranslationKey } from '../i18n/translations'

export type TranslationContextValue = {
  language: SupportedLanguageCode
  setLanguage: (language: SupportedLanguageCode) => void
  t: (key: TranslationKey) => string
}

export const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)
