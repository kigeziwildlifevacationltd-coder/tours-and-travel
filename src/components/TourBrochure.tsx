import { useEffect, useMemo, useState } from 'react'
import type { TourDetail } from '../data/tourDetails'
import { useRuntimeTranslatedList, useRuntimeTranslatedText } from '../hooks/useRuntimeTranslation'
import { toAbsoluteUrl } from '../seo/siteMetadata'
import type { Tour } from '../types/content'
import { useTranslation } from '../context/useTranslation'
import {
  BUSINESS_CONTACT_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE_PRIMARY,
  BUSINESS_PHONE_SECONDARY,
} from '../utils/businessInfo'

type TourBrochureProps = {
  tour: Tour
  detail: TourDetail
}

type BrochureImageAsset = {
  path: string
  caption: string
  keywords: string[]
}

const BROCHURE_LOGO_PATH = '/images/kigezi-wildlife-adventures-logo.png'

const brochureImageLibrary: BrochureImageAsset[] = [
  {
    path: '/images/tourists-near-mountain-gorilla-0024.jpg',
    caption: 'Gorilla trekking encounter',
    keywords: ['gorilla', 'bwindi', 'rushaga', 'mgahinga', 'primate'],
  },
  {
    path: '/images/gorilla-family-in-forest-0075.jpg',
    caption: 'Mountain gorilla family',
    keywords: ['gorilla', 'bwindi', 'primate', 'forest'],
  },
  {
    path: '/images/chimpanzee-portrait-in-greenery-0057.jpg',
    caption: 'Chimpanzee in Kibale forest',
    keywords: ['chimp', 'chimpanzee', 'kibale', 'budongo', 'kyambura', 'forest'],
  },
  {
    path: '/images/chimpanzees-walking-together-0074.jpg',
    caption: 'Chimpanzee tracking moment',
    keywords: ['chimp', 'chimpanzee', 'kibale', 'forest', 'habituation'],
  },
  {
    path: '/images/tree-climbing-lionesses-resting-0063.jpg',
    caption: 'Ishasha tree-climbing lions',
    keywords: ['ishasha', 'queen elizabeth', 'lion', 'wildlife', 'game drive'],
  },
  {
    path: '/images/elephant-herd-by-riverbank-0067.jpg',
    caption: 'Savannah wildlife on safari',
    keywords: ['wildlife', 'murchison', 'queen elizabeth', 'elephant', 'game drive'],
  },
  {
    path: '/images/safari-vehicle-in-grassland-0093.jpg',
    caption: 'Classic Uganda game drive',
    keywords: ['wildlife', 'safari', 'murchison', 'game drive', 'uganda'],
  },
  {
    path: '/images/waterfall-rapids-landscape-0043.jpg',
    caption: 'Murchison Falls landscape',
    keywords: ['murchison', 'falls', 'waterfall', 'nile'],
  },
  {
    path: '/images/tour-group-on-boat-0055.jpg',
    caption: 'Boat safari along the channel',
    keywords: ['boat', 'cruise', 'kazinga', 'channel', 'lake'],
  },
  {
    path: '/images/lake-islands-overlook-0031.jpg',
    caption: 'Lake Bunyonyi panorama',
    keywords: ['lake', 'bunyonyi', 'mutanda', 'islands', 'canoe'],
  },
  {
    path: '/images/woman-canoeing-on-lake-0053.jpg',
    caption: 'Scenic canoe experience',
    keywords: ['lake', 'bunyonyi', 'mutanda', 'canoe'],
  },
  {
    path: '/images/misty-mountain-valley-view-0074.jpg',
    caption: 'Highland valley scenery',
    keywords: ['mgahinga', 'mountain', 'highland', 'volcano', 'kisoro'],
  },
  {
    path: '/images/zebra-in-mountain-savannah-0086.jpg',
    caption: 'Kidepo savannah landscape',
    keywords: ['kidepo', 'savannah', 'wildlife', 'zebra'],
  },
  {
    path: '/images/giraffes-in-open-field-0084.jpg',
    caption: 'Lake Mburo wildlife plains',
    keywords: ['lake mburo', 'mburo', 'giraffe', 'wildlife'],
  },
  {
    path: '/images/monkey-on-tourist-head-0027.jpg',
    caption: 'Golden monkey region experience',
    keywords: ['golden monkey', 'monkey', 'mgahinga'],
  },
  {
    path: '/images/luxury-lodge-aerial-view-0094.jpg',
    caption: 'Lodge stay during safari',
    keywords: ['lodge', 'luxury', 'accommodation'],
  },
  {
    path: '/images/sunset-over-mountain-ridges-0081.jpg',
    caption: 'Uganda sunset scenery',
    keywords: ['sunset', 'landscape', 'uganda', 'scenic'],
  },
]

function normalizeKeywordText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanStopLabel(value: string) {
  return value
    .replace(/,\s*Uganda$/i, '')
    .replace(/,\s*Rwanda$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function trimText(value: string, maxLength: number) {
  const normalizedValue = value.replace(/\s+/g, ' ').trim()

  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  const shortenedValue = normalizedValue.slice(0, Math.max(maxLength - 1, 0))
  const lastSpaceIndex = shortenedValue.lastIndexOf(' ')
  const safeValue =
    lastSpaceIndex >= Math.floor(maxLength * 0.6)
      ? shortenedValue.slice(0, lastSpaceIndex)
      : shortenedValue

  return `${safeValue.trimEnd()}...`
}

function splitLongToken(value: string, maxChars: number) {
  if (value.length <= maxChars || maxChars < 2) {
    return [value]
  }

  const pieces: string[] = []
  let remainingValue = value

  while (remainingValue.length > maxChars) {
    const chunk = remainingValue.slice(0, maxChars)
    const preferredBreak = Math.max(
      chunk.lastIndexOf('/'),
      chunk.lastIndexOf('-'),
      chunk.lastIndexOf('@'),
      chunk.lastIndexOf('.'),
      chunk.lastIndexOf('_'),
    )
    const splitIndex = preferredBreak >= Math.floor(maxChars * 0.45) ? preferredBreak + 1 : maxChars

    pieces.push(remainingValue.slice(0, splitIndex))
    remainingValue = remainingValue.slice(splitIndex)
  }

  if (remainingValue) {
    pieces.push(remainingValue)
  }

  return pieces
}

function wrapText(value: string, maxChars: number) {
  const words = value
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .flatMap((word) => splitLongToken(word, maxChars))

  if (!words.length) {
    return ['']
  }

  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length <= maxChars || currentLine.length === 0) {
      currentLine = nextLine
      continue
    }

    lines.push(currentLine)
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function clampWrappedLines(value: string, maxChars: number, maxLines: number) {
  const lines = wrapText(value, maxChars)

  if (lines.length <= maxLines) {
    return lines
  }

  const visibleLines = lines.slice(0, maxLines)
  visibleLines[maxLines - 1] = trimText(lines.slice(maxLines - 1).join(' '), maxChars)

  return visibleLines
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildTextSpans(lines: readonly string[], x: number, lineHeight: number) {
  return lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('')
}

type BrochureMoment = {
  dayLabel: string
  headline: string
}

function buildPillGroupMarkup(items: readonly string[], startX: number, startY: number, maxWidth: number) {
  let currentX = startX
  let currentY = startY
  let currentRow = 1

  return items
    .slice(0, 3)
    .map((item) => trimText(item, 16))
    .reduce((markup, item) => {
      const pillWidth = Math.min(Math.max(item.length * 7 + 24, 94), maxWidth)

      if (currentX + pillWidth > startX + maxWidth) {
        if (currentRow >= 1) {
          return markup
        }

        currentX = startX
        currentY += 38
        currentRow += 1
      }

      const nextMarkup = `
        <rect x="${currentX}" y="${currentY}" width="${pillWidth}" height="30" rx="15" fill="#FFF6E3" fill-opacity="0.16" stroke="#F5E7C7" stroke-opacity="0.38" />
        <text x="${currentX + 14}" y="${currentY + 20}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="0.4" fill="#FFF7E8">${escapeXml(item)}</text>
      `

      currentX += pillWidth + 8

      return `${markup}${nextMarkup}`
    }, '')
}

function buildBulletListMarkup(
  items: readonly string[],
  startX: number,
  startY: number,
  bulletColor: string,
  textColor: string,
) {
  let currentY = startY

  return items
    .slice(0, 4)
    .map((item) => trimText(item, 24))
    .map((item) => {
      const markup = `
        <circle cx="${startX}" cy="${currentY - 5}" r="4.5" fill="${bulletColor}" />
        <text x="${startX + 14}" y="${currentY}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="${textColor}">${escapeXml(item)}</text>
      `

      currentY += 28

      return markup
    })
    .join('')
}

function buildMomentMarkup(moments: readonly BrochureMoment[], startX: number, startY: number) {
  let currentY = startY

  return moments
    .slice(0, 3)
    .map((moment, index) => {
      const headlineLines = clampWrappedLines(moment.headline, 30, 2)
      const dayLabel = trimText(moment.dayLabel, 14)
      const blockHeight = headlineLines.length > 1 ? 62 : 54
      const markup = `
        <rect x="${startX}" y="${currentY}" width="352" height="${blockHeight}" rx="22" fill="#FCF6EA" stroke="#E2D2AE" stroke-width="1.5" />
        <circle cx="${startX + 30}" cy="${currentY + 27}" r="15" fill="#3F6B46" />
        <text x="${startX + 30}" y="${currentY + 32}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#FFF8EA">${index + 1}</text>
        <text x="${startX + 58}" y="${currentY + 21}" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="700" letter-spacing="1.1" fill="#B7772D">${escapeXml(dayLabel.toUpperCase())}</text>
        <text x="${startX + 58}" y="${currentY + 39}" font-family="Arial, Helvetica, sans-serif" font-size="14.5" font-weight="600" fill="#263523">${buildTextSpans(headlineLines, startX + 58, 16)}</text>
      `

      currentY += blockHeight + 10

      return markup
    })
    .join('')
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildWebsiteLabel() {
  const websiteUrl = new URL(toAbsoluteUrl('/'))
  return websiteUrl.hostname.replace(/^www\./i, '')
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to prepare brochure asset.'))
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('Unable to read brochure asset.'))
    }

    reader.readAsDataURL(blob)
  })
}

async function fetchAssetDataUrl(path: string) {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Unable to load asset: ${path}`)
  }

  const blob = await response.blob()
  return blobToDataUrl(blob)
}

function selectBrochureImages(tour: Tour, detail: TourDetail) {
  const keywordText = normalizeKeywordText(
    [
      tour.id,
      tour.title,
      tour.summary,
      detail.overview,
      detail.bestFor,
      detail.snapshot.mainFocus,
      detail.snapshot.mainRoute,
      detail.snapshot.startEnd,
      ...detail.highlights,
      ...detail.routeStops,
    ].join(' '),
  )

  const tourImageAsset =
    brochureImageLibrary.find((asset) => asset.path === tour.image) ?? {
      path: tour.image,
      caption: `${tour.title} safari highlight`,
      keywords: [],
    }

  const rankedAssets = brochureImageLibrary
    .map((asset, index) => {
      const score = asset.keywords.reduce((total, keyword) => {
        return keywordText.includes(keyword) ? total + 6 : total
      }, 0)

      return {
        asset,
        score:
          score +
          (asset.path === tour.image ? 80 : 0) +
          (index < 6 ? 1 : 0),
      }
    })
    .sort((left, right) => right.score - left.score)

  const selectedAssets: BrochureImageAsset[] = [tourImageAsset]

  for (const entry of rankedAssets) {
    if (selectedAssets.some((asset) => asset.path === entry.asset.path)) {
      continue
    }

    selectedAssets.push(entry.asset)

    if (selectedAssets.length === 3) {
      break
    }
  }

  if (selectedAssets.length < 3) {
    for (const asset of brochureImageLibrary) {
      if (selectedAssets.some((entry) => entry.path === asset.path)) {
        continue
      }

      selectedAssets.push(asset)

      if (selectedAssets.length === 3) {
        break
      }
    }
  }

  return selectedAssets.slice(0, 3)
}

type TourBrochureSvgOptions = {
  brandName: string
  brochureTitle: string
  brandTagline: string
  overview: string
  duration: string
  startEnd: string
  mainFocus: string
  bestFor: string
  route: string
  routeStyle: string
  pace: string
  permitNote: string
  topExperiencesLabel: string
  journeyLabel: string
  routeLabel: string
  includedLabel: string
  mainFocusLabel: string
  bestForLabel: string
  startEndLabel: string
  paceLabel: string
  notesLabel: string
  durationLabel: string
  callLabel: string
  emailLabel: string
  officeLabel: string
  websiteLabel: string
  officeValue: string
  phoneValue: string
  emailValue: string
  websiteValue: string
  highlights: string[]
  includes: string[]
  moments: BrochureMoment[]
  imageCaptions: string[]
  heroImageDataUrl: string
  secondaryImageDataUrl: string
  accentImageDataUrl: string
  logoDataUrl: string
}

function buildTourBrochureSvg({
  brandName,
  brochureTitle,
  brandTagline,
  overview,
  duration,
  startEnd,
  mainFocus,
  bestFor,
  route,
  routeStyle,
  pace,
  permitNote,
  topExperiencesLabel,
  journeyLabel,
  routeLabel,
  includedLabel,
  mainFocusLabel,
  bestForLabel,
  startEndLabel,
  paceLabel,
  notesLabel,
  durationLabel,
  callLabel,
  emailLabel,
  officeLabel,
  websiteLabel,
  officeValue,
  phoneValue,
  emailValue,
  websiteValue,
  highlights,
  includes,
  moments,
  imageCaptions,
  heroImageDataUrl,
  secondaryImageDataUrl,
  accentImageDataUrl,
  logoDataUrl,
}: TourBrochureSvgOptions) {
  const titleLines = clampWrappedLines(brochureTitle, 18, 3)
  const overviewLines = clampWrappedLines(overview, 38, 3)
  const durationLines = clampWrappedLines(duration, 12, 2)
  const startEndLines = clampWrappedLines(startEnd, 17, 3)
  const focusLines = clampWrappedLines(mainFocus, 17, 4)
  const paceLines = clampWrappedLines(pace, 17, 4)
  const routeLines = clampWrappedLines(route.replace(/\s*\/\s*/g, ' / '), 27, 2)
  const routeStyleLines = clampWrappedLines(routeStyle, 31, 3)
  const bestForLines = clampWrappedLines(bestFor, 28, 2)
  const noteLines = clampWrappedLines(permitNote, 30, 2)
  const phoneLines = clampWrappedLines(phoneValue.replace(/\s*\/\s*/g, ' / '), 23, 2)
  const emailLines = clampWrappedLines(emailValue, 24, 2)
  const websiteLines = clampWrappedLines(websiteValue, 18, 2)
  const officeLines = clampWrappedLines(officeValue, 18, 1)
  const highlightMarkup = buildPillGroupMarkup(highlights, 118, 472, 316)
  const experienceMarkup = buildBulletListMarkup(highlights, 116, 1048, '#3F6B46', '#2C3925')
  const includeMarkup = buildBulletListMarkup(includes, 350, 1048, '#C48130', '#2C3925')
  const momentsMarkup = buildMomentMarkup(moments, 420, 740)
  const heroCaption = trimText(imageCaptions[0] ?? '', 24)
  const secondaryCaption = trimText(imageCaptions[1] ?? '', 18)
  const accentCaption = trimText(imageCaptions[2] ?? '', 16)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1275" viewBox="0 0 900 1275" fill="none">
      <defs>
        <linearGradient id="page-bg" x1="108" y1="62" x2="790" y2="1223" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFF9EC" />
          <stop offset="0.56" stop-color="#F8EFDD" />
          <stop offset="1" stop-color="#F2E4CB" />
        </linearGradient>
        <linearGradient id="hero-bg" x1="92" y1="92" x2="808" y2="518" gradientUnits="userSpaceOnUse">
          <stop stop-color="#163522" />
          <stop offset="0.54" stop-color="#24492D" />
          <stop offset="1" stop-color="#2C5B39" />
        </linearGradient>
        <linearGradient id="hero-overlay" x1="164" y1="112" x2="632" y2="536" gradientUnits="userSpaceOnUse">
          <stop stop-color="#274A2D" stop-opacity="0.05" />
          <stop offset="1" stop-color="#102615" stop-opacity="0.46" />
        </linearGradient>
        <linearGradient id="card-fill" x1="114" y1="548" x2="806" y2="1186" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFDF7" />
          <stop offset="1" stop-color="#F7EEDD" />
        </linearGradient>
        <linearGradient id="accent-shape" x1="678" y1="164" x2="780" y2="452" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F0C783" />
          <stop offset="1" stop-color="#C47B28" />
        </linearGradient>
        <linearGradient id="footer-band" x1="92" y1="1186" x2="808" y2="1260" gradientUnits="userSpaceOnUse">
          <stop stop-color="#21482B" />
          <stop offset="1" stop-color="#16311E" />
        </linearGradient>
        <filter id="card-shadow" x="16" y="20" width="868" height="1239" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="18"/>
          <feGaussianBlur stdDeviation="18"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.145098 0 0 0 0 0.176471 0 0 0 0 0.0980392 0 0 0 0.18 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
        </filter>
        <filter id="soft-shadow" x="68" y="532" width="764" height="664" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="10"/>
          <feGaussianBlur stdDeviation="12"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.180392 0 0 0 0 0.0901961 0 0 0 0.12 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
        </filter>
        <clipPath id="hero-clip">
          <rect x="548" y="118" width="238" height="296" rx="88" />
        </clipPath>
        <clipPath id="secondary-clip">
          <rect x="500" y="326" width="168" height="132" rx="30" />
        </clipPath>
        <clipPath id="accent-clip">
          <rect x="684" y="336" width="100" height="160" rx="50" />
        </clipPath>
        <clipPath id="hero-pills-clip">
          <rect x="116" y="468" width="320" height="36" rx="18" />
        </clipPath>
        <clipPath id="journey-content-clip">
          <rect x="410" y="740" width="380" height="204" rx="24" />
        </clipPath>
        <clipPath id="notes-content-clip">
          <rect x="580" y="1036" width="206" height="122" rx="18" />
        </clipPath>
      </defs>

      <rect width="900" height="1275" fill="#E9DFC7" />
      <g filter="url(#card-shadow)">
        <rect x="52" y="52" width="796" height="1171" rx="42" fill="url(#page-bg)" />
      </g>

      <circle cx="764" cy="142" r="130" fill="#F4E2BE" fill-opacity="0.48" />
      <circle cx="166" cy="1160" r="170" fill="#D6C08E" fill-opacity="0.18" />
      <path d="M94 116C170 92 256 94 336 126C430 164 514 218 610 204" stroke="#DCC79D" stroke-width="2" stroke-opacity="0.42" fill="none" />
      <path d="M122 1180C230 1120 344 1096 456 1110C572 1122 664 1170 774 1148" stroke="#D9C49D" stroke-width="2" stroke-opacity="0.34" fill="none" />

      <rect x="92" y="92" width="716" height="426" rx="36" fill="url(#hero-bg)" />
      <rect x="92" y="92" width="716" height="426" rx="36" fill="url(#hero-overlay)" />
      <circle cx="734" cy="126" r="136" fill="#54784E" fill-opacity="0.2" />
      <path d="M492 92C606 168 716 210 808 222V92H492Z" fill="#D8B06A" fill-opacity="0.16" />
      <path d="M102 496C186 444 280 432 382 474" stroke="#88A175" stroke-width="2" stroke-opacity="0.22" fill="none" />

      <rect x="704" y="154" width="88" height="252" rx="44" fill="url(#accent-shape)" fill-opacity="0.78" />
      <rect x="636" y="178" width="58" height="196" rx="29" fill="#F2D3A0" fill-opacity="0.36" transform="rotate(-22 636 178)" />

      <rect x="548" y="118" width="238" height="296" rx="88" fill="#DCC7A3" />
      <image href="${heroImageDataUrl}" x="548" y="118" width="238" height="296" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-clip)" />
      <rect x="548" y="118" width="238" height="296" rx="88" stroke="#FFF6E3" stroke-width="10" />

      <rect x="500" y="326" width="168" height="132" rx="30" fill="#F4E7D0" />
      <image href="${secondaryImageDataUrl}" x="500" y="326" width="168" height="132" preserveAspectRatio="xMidYMid slice" clip-path="url(#secondary-clip)" />
      <rect x="500" y="326" width="168" height="132" rx="30" stroke="#FFF8EA" stroke-width="8" />

      <rect x="684" y="336" width="100" height="160" rx="50" fill="#F4E7D0" />
      <image href="${accentImageDataUrl}" x="684" y="336" width="100" height="160" preserveAspectRatio="xMidYMid slice" clip-path="url(#accent-clip)" />
      <rect x="684" y="336" width="100" height="160" rx="50" stroke="#FFF8EA" stroke-width="8" />

      <rect x="118" y="116" width="76" height="76" rx="26" fill="#FFF3D9" />
      <image href="${logoDataUrl}" x="126" y="124" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
      <text x="212" y="150" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#FFF8EA">${escapeXml(brandName)}</text>
      <text x="212" y="176" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#E8D7B5">${escapeXml(brandTagline)}</text>

      <rect x="118" y="214" width="166" height="34" rx="17" fill="#FFF5E0" fill-opacity="0.14" stroke="#F2E2BE" stroke-opacity="0.38" />
      <text x="136" y="236" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.1" fill="#FFF6E4">${escapeXml(routeLabel.toUpperCase())}</text>

      <text x="118" y="278" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="700" fill="#FFF9ED">${buildTextSpans(titleLines, 118, 58)}</text>
      <text x="122" y="422" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#E8DDC7">${buildTextSpans(overviewLines, 122, 24)}</text>
      <g clip-path="url(#hero-pills-clip)">
        ${highlightMarkup}
      </g>

      <rect x="580" y="426" width="182" height="28" rx="14" fill="#FFF4DE" fill-opacity="0.96" />
      <text x="596" y="445" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#6B4B1A">${escapeXml(heroCaption)}</text>

      <rect x="502" y="474" width="154" height="26" rx="13" fill="#FFF7E7" fill-opacity="0.94" />
      <text x="516" y="491" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="700" fill="#6B4B1A">${escapeXml(secondaryCaption)}</text>

      <rect x="662" y="474" width="128" height="26" rx="13" fill="#FFF7E7" fill-opacity="0.94" />
      <text x="676" y="491" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="700" fill="#6B4B1A">${escapeXml(accentCaption)}</text>

      <g filter="url(#soft-shadow)">
        <rect x="92" y="548" width="164" height="128" rx="24" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
        <rect x="274" y="548" width="164" height="128" rx="24" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
        <rect x="456" y="548" width="164" height="128" rx="24" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
        <rect x="638" y="548" width="164" height="128" rx="24" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />

        <rect x="92" y="700" width="286" height="256" rx="30" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
        <rect x="396" y="700" width="412" height="256" rx="30" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />

        <rect x="92" y="986" width="216" height="178" rx="28" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
        <rect x="326" y="986" width="216" height="178" rx="28" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
        <rect x="560" y="986" width="248" height="178" rx="28" fill="url(#card-fill)" stroke="#E3D3B0" stroke-width="1.5" />
      </g>

      <text x="116" y="582" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A86D27">${escapeXml(durationLabel.toUpperCase())}</text>
      <text x="116" y="628" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="700" fill="#243220">${buildTextSpans(durationLines, 116, 34)}</text>

      <text x="298" y="582" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A86D27">${escapeXml(startEndLabel.toUpperCase())}</text>
      <text x="298" y="612" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#32422B">${buildTextSpans(startEndLines, 298, 18)}</text>

      <text x="480" y="582" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A86D27">${escapeXml(mainFocusLabel.toUpperCase())}</text>
      <text x="480" y="612" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#32422B">${buildTextSpans(focusLines, 480, 18)}</text>

      <text x="662" y="582" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A86D27">${escapeXml(paceLabel.toUpperCase())}</text>
      <text x="662" y="612" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#32422B">${buildTextSpans(paceLines, 662, 18)}</text>

      <text x="118" y="738" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.2" fill="#A86D27">${escapeXml(routeLabel.toUpperCase())}</text>
      <text x="118" y="782" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="700" fill="#243220">${buildTextSpans(routeLines, 118, 32)}</text>
      <line x1="118" y1="842" x2="352" y2="842" stroke="#E5D8BC" stroke-width="1.5" />
      <text x="118" y="874" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#58634F">${buildTextSpans(routeStyleLines, 118, 20)}</text>
      <path d="M124 920C170 874 228 930 286 892C308 878 328 860 344 856" stroke="#C78A39" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 10" fill="none" />
      <circle cx="124" cy="920" r="10" fill="#3F6B46" />
      <circle cx="236" cy="901" r="9" fill="#F7EDD8" stroke="#C78A39" stroke-width="3" />
      <circle cx="344" cy="856" r="10" fill="#3F6B46" />

      <text x="420" y="738" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.2" fill="#A86D27">${escapeXml(journeyLabel.toUpperCase())}</text>
      <g clip-path="url(#journey-content-clip)">
        ${momentsMarkup}
      </g>

      <text x="116" y="1020" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#243220">${escapeXml(topExperiencesLabel)}</text>
      ${experienceMarkup}

      <text x="350" y="1020" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#243220">${escapeXml(includedLabel)}</text>
      ${includeMarkup}

      <text x="584" y="1020" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#243220">${escapeXml(notesLabel)}</text>
      <g clip-path="url(#notes-content-clip)">
        <text x="584" y="1048" font-family="Arial, Helvetica, sans-serif" font-size="13.5" fill="#58634F">${buildTextSpans(noteLines, 584, 16)}</text>
        <line x1="584" y1="1092" x2="784" y2="1092" stroke="#E5D8BC" stroke-width="1.5" />
        <text x="584" y="1114" font-family="Arial, Helvetica, sans-serif" font-size="11.5" font-weight="700" letter-spacing="1.1" fill="#A86D27">${escapeXml(bestForLabel.toUpperCase())}</text>
        <text x="584" y="1136" font-family="Arial, Helvetica, sans-serif" font-size="13.5" font-weight="600" fill="#32422B">${buildTextSpans(bestForLines, 584, 16)}</text>
      </g>

      <rect x="92" y="1186" width="716" height="74" rx="26" fill="url(#footer-band)" />
      <line x1="334" y1="1200" x2="334" y2="1248" stroke="#5A7D55" stroke-width="1.2" />
      <line x1="586" y1="1200" x2="586" y2="1248" stroke="#5A7D55" stroke-width="1.2" />

      <text x="118" y="1210" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#D9C790">${escapeXml(callLabel.toUpperCase())}</text>
      <text x="118" y="1236" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#FFF6E4">${buildTextSpans(phoneLines, 118, 18)}</text>

      <text x="360" y="1210" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#D9C790">${escapeXml(emailLabel.toUpperCase())}</text>
      <text x="360" y="1236" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#FFF6E4">${buildTextSpans(emailLines, 360, 17)}</text>

      <text x="612" y="1210" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#D9C790">${escapeXml(websiteLabel.toUpperCase())}</text>
      <text x="612" y="1231" font-family="Arial, Helvetica, sans-serif" font-size="13.5" font-weight="700" fill="#FFF6E4">${buildTextSpans(websiteLines, 612, 16)}</text>
      <text x="612" y="1252" font-family="Arial, Helvetica, sans-serif" font-size="11.5" fill="#E8DFBF">${escapeXml(officeLabel.toUpperCase())}</text>
      <text x="678" y="1252" font-family="Arial, Helvetica, sans-serif" font-size="11.5" fill="#FFF6E4">${buildTextSpans(officeLines, 678, 14)}</text>
    </svg>
  `.trim()
}

export function TourBrochure({ tour, detail }: TourBrochureProps) {
  const { t } = useTranslation()
  const translatedTourTitle = useRuntimeTranslatedText(tour.title)
  const translatedOverview = useRuntimeTranslatedText(detail.overview)
  const translatedBestFor = useRuntimeTranslatedText(detail.bestFor)
  const translatedMainFocus = useRuntimeTranslatedText(detail.snapshot.mainFocus)
  const translatedStartEnd = useRuntimeTranslatedText(detail.snapshot.startEnd)
  const translatedRouteStyle = useRuntimeTranslatedText(detail.snapshot.routeStyle)
  const translatedPace = useRuntimeTranslatedText(detail.snapshot.pace)
  const translatedMainRoute = useRuntimeTranslatedText(
    detail.snapshot.mainRoute
      .split('/')
      .map((segment) => cleanStopLabel(segment))
      .join(' / '),
  )
  const translatedPermitNote = useRuntimeTranslatedText(detail.snapshot.permitPlanning)
  const translatedHighlights = useRuntimeTranslatedList(detail.highlights.slice(0, 4))
  const translatedIncludes = useRuntimeTranslatedList(detail.includes.slice(0, 4))
  const brochureImages = selectBrochureImages(tour, detail)
  const translatedImageCaptions = useRuntimeTranslatedList(
    brochureImages.map((asset) => asset.caption),
  )
  const translatedMomentLabels = useRuntimeTranslatedList(
    detail.itineraryDays.slice(0, 3).map((day) => day.dayLabel),
  )
  const translatedMomentHeadlines = useRuntimeTranslatedList(
    detail.itineraryDays.slice(0, 3).map((day) => day.headline),
  )
  const brochureImagePaths = brochureImages.map((asset) => asset.path)
  const brochureImageSignature = brochureImagePaths.join('|')
  const [embeddedAssetState, setEmbeddedAssetState] = useState<{
    key: string
    value: Record<string, string>
  }>({
    key: '',
    value: {},
  })
  const embeddedAssetMap =
    embeddedAssetState.key === brochureImageSignature ? embeddedAssetState.value : {}

  useEffect(() => {
    let isActive = true
    const assetPaths = [BROCHURE_LOGO_PATH, ...brochureImageSignature.split('|').filter(Boolean)]

    Promise.allSettled(
      assetPaths.map(async (path) => {
        const dataUrl = await fetchAssetDataUrl(path)
        return [path, dataUrl] as const
      }),
    ).then((results) => {
      if (!isActive) {
        return
      }

      const nextAssetMap = results.reduce<Record<string, string>>((accumulator, result) => {
        if (result.status === 'fulfilled') {
          const [path, dataUrl] = result.value
          accumulator[path] = dataUrl
        }

        return accumulator
      }, {})

      setEmbeddedAssetState({
        key: brochureImageSignature,
        value: nextAssetMap,
      })
    })

    return () => {
      isActive = false
    }
  }, [brochureImageSignature])

  const hasBrochureAssets = [BROCHURE_LOGO_PATH, ...brochureImages.map((asset) => asset.path)].every(
    (path) => Boolean(embeddedAssetMap[path]),
  )

  const brochureSvgMarkup = hasBrochureAssets
    ? buildTourBrochureSvg({
        brandName: BUSINESS_NAME,
        brochureTitle: translatedTourTitle || tour.title,
        brandTagline: t('about.sloganValue'),
        overview: translatedOverview || detail.overview,
        duration: tour.duration,
        startEnd: translatedStartEnd || detail.snapshot.startEnd,
        mainFocus: translatedMainFocus || detail.snapshot.mainFocus,
        bestFor: translatedBestFor || detail.bestFor,
        route: translatedMainRoute || detail.snapshot.mainRoute,
        routeStyle: translatedRouteStyle || detail.snapshot.routeStyle,
        pace: translatedPace || detail.snapshot.pace,
        permitNote: translatedPermitNote || detail.snapshot.permitPlanning,
        topExperiencesLabel: t('tourDetail.brochureTopExperiences'),
        journeyLabel: t('tourDetail.dayFlowLabel'),
        routeLabel: t('tourDetail.snapshotMainRoute'),
        includedLabel: t('tourDetail.whatIncluded'),
        mainFocusLabel: t('tourDetail.snapshotMainFocus'),
        bestForLabel: t('tourDetail.bestFor').replace(/:\s*$/u, ''),
        startEndLabel: t('tourDetail.snapshotStartEnd'),
        paceLabel: t('tourDetail.snapshotPace'),
        notesLabel: t('tourDetail.notesTitle'),
        durationLabel: t('tours.form.durationDays'),
        callLabel: t('tourDetail.brochureCallLabel'),
        emailLabel: t('tourDetail.brochureEmailLabel'),
        officeLabel: t('tourDetail.brochureOfficeLabel'),
        websiteLabel: t('tourDetail.brochureWebsiteLabel'),
        officeValue: t('common.officeValue'),
        phoneValue: `${BUSINESS_PHONE_PRIMARY} / ${BUSINESS_PHONE_SECONDARY}`,
        emailValue: BUSINESS_CONTACT_EMAIL,
        websiteValue: buildWebsiteLabel(),
        highlights: translatedHighlights.length ? translatedHighlights : detail.highlights,
        includes: translatedIncludes.length ? translatedIncludes : detail.includes,
        moments: detail.itineraryDays.slice(0, 3).map((day, index) => ({
          dayLabel: translatedMomentLabels[index] || day.dayLabel,
          headline: translatedMomentHeadlines[index] || day.headline,
        })),
        imageCaptions: brochureImages.map(
          (asset, index) => translatedImageCaptions[index] || asset.caption,
        ),
        heroImageDataUrl: embeddedAssetMap[brochureImages[0].path],
        secondaryImageDataUrl: embeddedAssetMap[brochureImages[1].path],
        accentImageDataUrl: embeddedAssetMap[brochureImages[2].path],
        logoDataUrl: embeddedAssetMap[BROCHURE_LOGO_PATH],
      })
    : null

  const brochureUrl = useMemo(() => {
    if (!brochureSvgMarkup) {
      return null
    }

    return URL.createObjectURL(new Blob([brochureSvgMarkup], { type: 'image/svg+xml;charset=utf-8' }))
  }, [brochureSvgMarkup])

  useEffect(() => {
    if (!brochureUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(brochureUrl)
    }
  }, [brochureUrl])

  const brochureFileName = `${sanitizeFileName(tour.id || tour.title)}-brochure.svg`
  const brochurePreviewAlt = `${t('tourDetail.brochurePreviewAltPrefix')} ${translatedTourTitle || tour.title}`

  return (
    <article className="service-detail-panel tour-brochure-panel">
      <div className="tour-brochure-head">
        <div>
          <p className="service-detail-label">{t('tourDetail.brochureLabel')}</p>
          <h3>{t('tourDetail.brochureTitle')}</h3>
          <p className="service-detail-description">{t('tourDetail.brochureDescription')}</p>
        </div>
        {brochureUrl ? (
          <a href={brochureUrl} download={brochureFileName} className="btn btn-primary">
            {t('tourDetail.brochureDownload')}
          </a>
        ) : (
          <button type="button" className="btn btn-primary" disabled>
            {t('tourDetail.brochurePreparing')}
          </button>
        )}
      </div>

      <div className="tour-brochure-shell">
        <div className="tour-brochure-preview">
          {brochureUrl ? (
            <img src={brochureUrl} alt={brochurePreviewAlt} loading="lazy" />
          ) : (
            <div className="tour-brochure-loading">
              <p>{t('tourDetail.brochurePreparing')}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
