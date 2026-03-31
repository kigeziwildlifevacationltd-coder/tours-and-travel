import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const rootDir = process.cwd()

const sourceFiles = [
  'src/i18n/translations.ts',
  'src/data/siteContent.ts',
  'src/data/serviceDetails.ts',
  'src/data/tourDetails.ts',
  'src/components/Footer.tsx',
  'src/components/Navbar.tsx',
  'src/components/LanguageSwitcher.tsx',
  'src/components/PageHero.tsx',
]

const targetLanguages = ['fr', 'de', 'es', 'it', 'ru', 'pt']
const outputFile = path.join(rootDir, 'src/i18n/staticRuntimeTranslations.ts')

function isLikelyUiText(input) {
  const value = input.trim()

  if (!value) {
    return false
  }

  if (!/[A-Za-z]/.test(value)) {
    return false
  }

  if (value.length < 2) {
    return false
  }

  if (value.includes('${')) {
    return false
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return false
  }

  if (value.startsWith('/images/') || value.startsWith('/fonts/') || value.startsWith('/assets/')) {
    return false
  }

  if (value.includes('@')) {
    return false
  }

  if (/^[a-z]+(?:\.[a-z0-9]+)+$/i.test(value)) {
    return false
  }

  if (/^[a-z0-9_/-]+$/i.test(value) && !/[A-Z]/.test(value) && !value.includes(' ')) {
    return false
  }

  if (/^[./A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value) && !value.includes(' ')) {
    return false
  }

  return true
}

function collectStringLiterals(filePath) {
  const sourceText = ts.sys.readFile(filePath, 'utf8') ?? ''
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true)
  const results = []

  const visit = (node) => {
    if (ts.isStringLiteralLike(node)) {
      results.push(node.text)
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      results.push(node.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return results
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function translateViaGoogleEndpoint(text, targetLanguage) {
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=en&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Translate request failed with status ${response.status}`)
  }

  const payload = await response.json()
  const sentences = Array.isArray(payload?.[0]) ? payload[0] : []
  const translated = sentences
    .map((part) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
    .join('')
    .trim()

  if (!translated) {
    return text
  }

  return translated
}

async function translateWithRetry(text, targetLanguage) {
  let attempt = 0

  while (attempt < 4) {
    try {
      return await translateViaGoogleEndpoint(text, targetLanguage)
    } catch (error) {
      attempt += 1

      if (attempt >= 4) {
        return text
      }

      await delay(180 * attempt)
    }
  }

  return text
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length)
  let nextIndex = 0

  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const index = nextIndex

      if (index >= items.length) {
        return
      }

      nextIndex += 1
      results[index] = await worker(items[index], index)
    }
  })

  await Promise.all(runners)
  return results
}

function escapeForComment(input) {
  return input.replace(/\s+/g, ' ').trim().slice(0, 70)
}

async function main() {
  const absoluteSourceFiles = sourceFiles.map((relativePath) => path.join(rootDir, relativePath))
  const seeds = new Set()

  for (const filePath of absoluteSourceFiles) {
    const values = collectStringLiterals(filePath)

    for (const value of values) {
      if (isLikelyUiText(value)) {
        seeds.add(value)
      }
    }
  }

  const allSeedTexts = [...seeds].sort((a, b) => a.localeCompare(b))
  const translationByLanguage = {}

  for (const language of targetLanguages) {
    console.log(`Translating ${allSeedTexts.length} strings to ${language}...`)

    const pairs = await runWithConcurrency(
      allSeedTexts,
      6,
      async (text, index) => {
        const translated = await translateWithRetry(text, language)

        if (index % 50 === 0) {
          console.log(`[${language}] ${index + 1}/${allSeedTexts.length}: ${escapeForComment(text)}`)
        }

        return [text, translated]
      },
    )

    translationByLanguage[language] = Object.fromEntries(pairs)
  }

  const header = "import type { SupportedLanguageCode } from './translations'\n\n"
  const body =
    'export const staticRuntimeTranslations: Partial<Record<SupportedLanguageCode, Record<string, string>>> = ' +
    `${JSON.stringify(translationByLanguage, null, 2)}\n`

  await fs.writeFile(outputFile, header + body, 'utf8')
  console.log(`Wrote static translations to ${outputFile}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
