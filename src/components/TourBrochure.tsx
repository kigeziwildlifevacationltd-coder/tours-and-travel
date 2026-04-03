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

function wrapText(value: string, maxChars: number) {
  const words = value.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)

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

  return items
    .slice(0, 4)
    .map((item) => trimText(item, 22))
    .map((item) => {
      const pillWidth = Math.min(Math.max(item.length * 8.3 + 28, 110), maxWidth)

      if (currentX + pillWidth > startX + maxWidth) {
        currentX = startX
        currentY += 42
      }

      const markup = `
        <rect x="${currentX}" y="${currentY}" width="${pillWidth}" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-opacity="0.38" />
        <text x="${currentX + 16}" y="${currentY + 22}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${escapeXml(item)}</text>
      `

      currentX += pillWidth + 10

      return markup
    })
    .join('')
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
    .map((item) => trimText(item, 28))
    .map((item) => {
      const markup = `
        <circle cx="${startX}" cy="${currentY - 6}" r="5" fill="${bulletColor}" />
        <text x="${startX + 16}" y="${currentY}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="${textColor}">${escapeXml(item)}</text>
      `

      currentY += 34

      return markup
    })
    .join('')
}

function buildMomentMarkup(moments: readonly BrochureMoment[], startX: number, startY: number) {
  let currentY = startY

  return moments
    .slice(0, 3)
    .map((moment, index) => {
      const headlineLines = clampWrappedLines(moment.headline, 24, 2)
      const blockHeight = headlineLines.length > 1 ? 58 : 48
      const markup = `
        <circle cx="${startX + 10}" cy="${currentY + 18}" r="11" fill="#1B6FAE" />
        <text x="${startX + 10}" y="${currentY + 23}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">${index + 1}</text>
        <text x="${startX + 34}" y="${currentY + 12}" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="1" fill="#1B6FAE">${escapeXml(moment.dayLabel.toUpperCase())}</text>
        <text x="${startX + 34}" y="${currentY + 30}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#31465A">${buildTextSpans(headlineLines, startX + 34, 18)}</text>
        ${
          index < Math.min(moments.length, 3) - 1
            ? `<line x1="${startX + 10}" y1="${currentY + 30}" x2="${startX + 10}" y2="${currentY + blockHeight}" stroke="#C5DBEA" stroke-width="3" stroke-linecap="round" />`
            : ''
        }
      `

      currentY += blockHeight

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
  const titleLines = clampWrappedLines(brochureTitle, 17, 3)
  const overviewLines = clampWrappedLines(overview, 36, 4)
  const durationLines = clampWrappedLines(duration, 12, 2)
  const startEndLines = clampWrappedLines(startEnd, 21, 4)
  const focusLines = clampWrappedLines(mainFocus, 22, 3)
  const paceLines = clampWrappedLines(pace, 22, 3)
  const routeLines = clampWrappedLines(route.replace(/\s*\/\s*/g, ' / '), 52, 2)
  const routeStyleLines = clampWrappedLines(routeStyle, 58, 2)
  const bestForLines = clampWrappedLines(bestFor, 34, 3)
  const noteLines = clampWrappedLines(permitNote, 30, 3)
  const highlightMarkup = buildPillGroupMarkup(highlights, 106, 534, 336)
  const experienceMarkup = buildBulletListMarkup(highlights, 122, 968, '#1B6FAE', '#31465A')
  const includeMarkup = buildBulletListMarkup(includes, 332, 968, '#C97A22', '#31465A')
  const momentsMarkup = buildMomentMarkup(moments, 544, 956)
  const heroCaption = trimText(imageCaptions[0] ?? '', 28)
  const secondaryCaption = trimText(imageCaptions[1] ?? '', 22)
  const accentCaption = trimText(imageCaptions[2] ?? '', 20)

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1275" viewBox="0 0 900 1275" fill="none">
      <defs>
        <linearGradient id="page-bg" x1="124" y1="70" x2="786" y2="1208" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FAFDFF" />
          <stop offset="1" stop-color="#F7F2E7" />
        </linearGradient>
        <linearGradient id="hero-overlay" x1="100" y1="100" x2="460" y2="570" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0E3957" stop-opacity="0.94" />
          <stop offset="1" stop-color="#0E3957" stop-opacity="0.12" />
        </linearGradient>
        <linearGradient id="route-band" x1="100" y1="594" x2="804" y2="714" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EFF7FC" />
          <stop offset="1" stop-color="#FFFFFF" />
        </linearGradient>
        <linearGradient id="footer-band" x1="100" y1="1124" x2="804" y2="1200" gradientUnits="userSpaceOnUse">
          <stop stop-color="#154D76" />
          <stop offset="1" stop-color="#0E6DA6" />
        </linearGradient>
        <linearGradient id="accent-shape" x1="650" y1="188" x2="788" y2="406" gradientUnits="userSpaceOnUse">
          <stop stop-color="#4BB5EE" />
          <stop offset="1" stop-color="#1F79B7" />
        </linearGradient>
        <filter id="card-shadow" x="32" y="36" width="836" height="1201" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="18"/>
          <feGaussianBlur stdDeviation="20"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.137255 0 0 0 0 0.203922 0 0 0 0.18 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
        </filter>
        <clipPath id="hero-clip">
          <rect x="474" y="122" width="286" height="360" rx="122" />
        </clipPath>
        <clipPath id="secondary-clip">
          <rect x="434" y="336" width="182" height="172" rx="34" />
        </clipPath>
        <clipPath id="accent-clip">
          <rect x="666" y="372" width="110" height="154" rx="55" />
        </clipPath>
      </defs>

      <rect width="900" height="1275" fill="#EDEAE4" />
      <g filter="url(#card-shadow)">
        <rect x="68" y="60" width="764" height="1151" rx="40" fill="url(#page-bg)" />
      </g>

      <circle cx="722" cy="204" r="132" fill="#EEF8FE" />
      <circle cx="206" cy="1128" r="156" fill="#F9F3E7" />
      <path d="M620 104C693 186 743 217 824 227V104H620Z" fill="#EEF7FD" />
      <rect x="694" y="160" width="98" height="284" rx="49" fill="url(#accent-shape)" opacity="0.92" />
      <rect x="617" y="198" width="52" height="188" rx="26" fill="#7BC9EF" opacity="0.75" transform="rotate(-28 617 198)" />

      <rect x="100" y="100" width="704" height="470" rx="38" fill="#0E3957" />
      <rect x="100" y="100" width="704" height="470" rx="38" fill="url(#hero-overlay)" />

      <rect x="474" y="122" width="286" height="360" rx="122" fill="#D4E8F4" />
      <image href="${heroImageDataUrl}" x="474" y="122" width="286" height="360" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-clip)" />
      <rect x="474" y="122" width="286" height="360" rx="122" stroke="#FFFFFF" stroke-width="10" />

      <rect x="434" y="336" width="182" height="172" rx="34" fill="#FFFFFF" />
      <image href="${secondaryImageDataUrl}" x="434" y="336" width="182" height="172" preserveAspectRatio="xMidYMid slice" clip-path="url(#secondary-clip)" />
      <rect x="434" y="336" width="182" height="172" rx="34" stroke="#FFFFFF" stroke-width="8" />

      <rect x="666" y="372" width="110" height="154" rx="55" fill="#FFFFFF" />
      <image href="${accentImageDataUrl}" x="666" y="372" width="110" height="154" preserveAspectRatio="xMidYMid slice" clip-path="url(#accent-clip)" />
      <rect x="666" y="372" width="110" height="154" rx="55" stroke="#FFFFFF" stroke-width="8" />

      <rect x="108" y="112" width="68" height="68" rx="20" fill="#F0F8FD" />
      <image href="${logoDataUrl}" x="114" y="118" width="56" height="56" preserveAspectRatio="xMidYMid meet" />
      <text x="190" y="138" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" fill="#FFFFFF">${escapeXml(brandName)}</text>
      <text x="190" y="164" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#A8DDFB">${escapeXml(brandTagline)}</text>

      <rect x="108" y="204" width="164" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.18" stroke="#FFFFFF" stroke-opacity="0.36" />
      <text x="126" y="226" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.1" fill="#FFFFFF">${escapeXml(routeLabel.toUpperCase())}</text>

      <text x="108" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="60" font-weight="700" fill="#FFFFFF">${buildTextSpans(titleLines, 108, 62)}</text>
      <text x="112" y="446" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#E4F0F7">${buildTextSpans(overviewLines, 112, 27)}</text>
      ${highlightMarkup}

      <rect x="530" y="458" width="186" height="30" rx="15" fill="#FFFFFF" fill-opacity="0.94" />
      <text x="548" y="478" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#1A628F">${escapeXml(heroCaption)}</text>

      <rect x="438" y="520" width="156" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.95" />
      <text x="454" y="538" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#1A628F">${escapeXml(secondaryCaption)}</text>

      <rect x="646" y="532" width="140" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.95" />
      <text x="662" y="550" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#1A628F">${escapeXml(accentCaption)}</text>

      <rect x="100" y="594" width="704" height="120" rx="30" fill="url(#route-band)" stroke="#D7E6F1" stroke-width="2" />
      <text x="126" y="632" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="1.2" fill="#1A6DAB">${escapeXml(routeLabel.toUpperCase())}</text>
      <text x="126" y="664" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#183B54">${buildTextSpans(routeLines, 126, 28)}</text>
      <text x="126" y="700" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#5B7080">${buildTextSpans(routeStyleLines, 126, 20)}</text>

      <rect x="100" y="736" width="216" height="146" rx="28" fill="#FFFFFF" stroke="#D7E6F1" stroke-width="2" />
      <text x="124" y="774" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.1" fill="#1A6DAB">${escapeXml(durationLabel.toUpperCase())}</text>
      <text x="124" y="821" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" fill="#183B54">${buildTextSpans(durationLines, 124, 36)}</text>

      <rect x="344" y="736" width="216" height="146" rx="28" fill="#FFFFFF" stroke="#D7E6F1" stroke-width="2" />
      <text x="368" y="774" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.1" fill="#1A6DAB">${escapeXml(startEndLabel.toUpperCase())}</text>
      <text x="368" y="804" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#31465A">${buildTextSpans(startEndLines, 368, 22)}</text>

      <rect x="588" y="736" width="216" height="146" rx="28" fill="#FFFFFF" stroke="#D7E6F1" stroke-width="2" />
      <text x="612" y="774" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="1.1" fill="#1A6DAB">${escapeXml(paceLabel.toUpperCase())}</text>
      <text x="612" y="804" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#31465A">${buildTextSpans(paceLines, 612, 22)}</text>

      <rect x="100" y="910" width="192" height="196" rx="28" fill="#FFFFFF" stroke="#D7E6F1" stroke-width="2" />
      <text x="122" y="946" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#183B54">${escapeXml(topExperiencesLabel)}</text>
      ${experienceMarkup}
      <text x="122" y="1072" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#1A6DAB">${escapeXml(mainFocusLabel.toUpperCase())}</text>
      <text x="122" y="1094" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#5B7080">${buildTextSpans(focusLines, 122, 18)}</text>

      <rect x="310" y="910" width="192" height="196" rx="28" fill="#FFFFFF" stroke="#D7E6F1" stroke-width="2" />
      <text x="332" y="946" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#183B54">${escapeXml(includedLabel)}</text>
      ${includeMarkup}
      <text x="332" y="1072" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#C97A22">${escapeXml(bestForLabel.toUpperCase())}</text>
      <text x="332" y="1094" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#5B7080">${buildTextSpans(bestForLines, 332, 18)}</text>

      <rect x="520" y="910" width="284" height="196" rx="28" fill="#FFFFFF" stroke="#D7E6F1" stroke-width="2" />
      <text x="544" y="946" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#183B54">${escapeXml(journeyLabel)}</text>
      ${momentsMarkup}
      <text x="544" y="1066" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#1A6DAB">${escapeXml(notesLabel.toUpperCase())}</text>
      <text x="544" y="1088" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#5B7080">${buildTextSpans(noteLines, 544, 18)}</text>

      <rect x="100" y="1124" width="704" height="76" rx="26" fill="url(#footer-band)" />
      <text x="128" y="1152" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A8DBFF">${escapeXml(callLabel.toUpperCase())}</text>
      <text x="128" y="1181" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#FFFFFF">${escapeXml(phoneValue)}</text>

      <text x="384" y="1152" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A8DBFF">${escapeXml(emailLabel.toUpperCase())}</text>
      <text x="384" y="1181" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">${escapeXml(emailValue)}</text>

      <text x="648" y="1152" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.1" fill="#A8DBFF">${escapeXml(websiteLabel.toUpperCase())}</text>
      <text x="648" y="1176" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">${escapeXml(websiteValue)}</text>
      <text x="648" y="1194" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#D9EEF9">${escapeXml(officeLabel)}: ${escapeXml(officeValue)}</text>
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
        imageCaptions: translatedImageCaptions,
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
