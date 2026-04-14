import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../context/useTranslation'
import {
  getCachedRuntimeTranslation,
  getCachedRuntimeTranslations,
  translateRuntimeList,
  translateRuntimeText,
} from '../i18n/runtimeTranslator'

export function useRuntimeTranslatedText(text: string): string {
  const { language } = useTranslation()
  const requestKey = `${language}\u001f${text}`
  const cachedValue = useMemo(
    () => getCachedRuntimeTranslation(text, language) ?? text,
    [language, text],
  )
  const [translationState, setTranslationState] = useState<{ key: string; value: string }>({
    key: requestKey,
    value: cachedValue,
  })

  useEffect(() => {
    setTranslationState((current) => {
      if (current.key === requestKey && current.value === cachedValue) {
        return current
      }

      return { key: requestKey, value: cachedValue }
    })
  }, [cachedValue, requestKey])

  useEffect(() => {
    if (language === 'en') {
      return
    }

    let isActive = true

    translateRuntimeText(text, language)
      .then((value) => {
        if (isActive) {
          setTranslationState((current) => {
            if (current.key === requestKey && current.value === value) {
              return current
            }

            return { key: requestKey, value }
          })
        }
      })
      .catch(() => {
        if (isActive) {
          setTranslationState((current) => {
            if (current.key === requestKey && current.value === text) {
              return current
            }

            return { key: requestKey, value: text }
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [text, language, requestKey])

  return translationState.key === requestKey ? translationState.value : cachedValue
}

export function useRuntimeTranslatedList(items: readonly string[]): string[] {
  const { language } = useTranslation()
  const signature = useMemo(() => items.join('\u001f'), [items])
  const sourceItems = useMemo(() => [...items], [items])
  const cachedValues = useMemo(
    () => getCachedRuntimeTranslations(sourceItems, language),
    [language, sourceItems],
  )
  const requestKey = `${language}\u001f${signature}`
  const [translationState, setTranslationState] = useState<{ key: string; value: string[] }>({
    key: requestKey,
    value: cachedValues,
  })

  useEffect(() => {
    setTranslationState((current) => {
      if (
        current.key === requestKey &&
        current.value.length === cachedValues.length &&
        current.value.every((item, index) => item === cachedValues[index])
      ) {
        return current
      }

      return { key: requestKey, value: cachedValues }
    })
  }, [cachedValues, requestKey])

  useEffect(() => {
    if (language === 'en') {
      return
    }

    let isActive = true

    translateRuntimeList(sourceItems, language)
      .then((value) => {
        if (isActive) {
          setTranslationState((current) => {
            if (
              current.key === requestKey &&
              current.value.length === value.length &&
              current.value.every((item, index) => item === value[index])
            ) {
              return current
            }

            return { key: requestKey, value }
          })
        }
      })
      .catch(() => {
        if (isActive) {
          setTranslationState((current) => {
            if (
              current.key === requestKey &&
              current.value.length === sourceItems.length &&
              current.value.every((item, index) => item === sourceItems[index])
            ) {
              return current
            }

            return { key: requestKey, value: sourceItems }
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [language, requestKey, sourceItems])

  return translationState.key === requestKey ? translationState.value : cachedValues
}
