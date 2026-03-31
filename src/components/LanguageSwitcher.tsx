import type { ChangeEvent } from 'react'
import { useTranslation } from '../context/useTranslation'
import type { TranslationKey } from '../i18n/translations'
import { supportedLanguageCodes, type SupportedLanguageCode } from '../i18n/translations'

function isSupportedLanguageCode(value: string): value is SupportedLanguageCode {
  return supportedLanguageCodes.includes(value as SupportedLanguageCode)
}

function getLanguageOptionKey(languageCode: SupportedLanguageCode): TranslationKey {
  return `language.option.${languageCode}` as TranslationKey
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value
    setLanguage(isSupportedLanguageCode(nextLanguage) ? nextLanguage : 'en')
  }

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="visually-hidden">
        {t('language.label')}
      </label>
      <select
        id="language-select"
        className="language-select"
        value={language}
        onChange={handleChange}
        aria-label={t('language.label')}
      >
        {supportedLanguageCodes.map((languageCode) => (
          <option key={languageCode} value={languageCode}>
            {t(getLanguageOptionKey(languageCode))}
          </option>
        ))}
      </select>
    </div>
  )
}
