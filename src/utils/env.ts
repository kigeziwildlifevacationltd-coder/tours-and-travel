export const readEnvValue = (value: string | undefined): string => {
  const normalized = (value ?? '').trim()

  if (normalized.length >= 2) {
    const firstChar = normalized[0]
    const lastChar = normalized[normalized.length - 1]

    if (
      (firstChar === '"' && lastChar === '"') ||
      (firstChar === "'" && lastChar === "'")
    ) {
      return normalized.slice(1, -1).trim()
    }
  }

  return normalized
}

export const readEnvValueOr = (value: string | undefined, fallback: string): string => {
  const normalized = readEnvValue(value)
  return normalized.length > 0 ? normalized : fallback
}
