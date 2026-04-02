import type { Tour } from '../types/content'

export type TourDetail = {
  overview: string
  highlights: string[]
  itineraryOutline: string[]
  itineraryDays: TourItineraryDay[]
  snapshot: TourSnapshot
  planningNotes: string[]
  quotation: string[]
  includes: string[]
  excludes: string[]
  packages: string[]
  bestFor: string
  routeStops: string[]
  mapLocation: string
  mapEmbedUrl: string
}

export type TourSnapshot = {
  startEnd: string
  routeStyle: string
  pace: string
  mainFocus: string
  mainRoute: string
  permitPlanning: string
}

export type TourItineraryDay = {
  id: string
  dayLabel: string
  headline: string
  details: string[]
  highlights: string[]
  baseLocation: string
  overnightLocation: string
}

const buildMapEmbedUrl = (location: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`

const defaultPackages = [
  'Budget package: value-focused lodges, shared safari vehicle, and standard meals.',
  'Mid-range package: handpicked lodges, private vehicle, and full-board meals.',
  'Luxury package: premium lodges, private guide, and curated safari experiences.',
]

type TourDetailContent = Omit<
  TourDetail,
  'mapEmbedUrl' | 'packages' | 'itineraryDays' | 'snapshot' | 'planningNotes' | 'excludes' | 'quotation'
> & {
  routeStops?: string[]
  packages?: string[]
  itineraryDays?: TourItineraryDay[]
  snapshot?: TourSnapshot
  planningNotes?: string[]
  excludes?: string[]
  quotation?: string[]
}

type ItineraryInsightRule = {
  pattern: RegExp
  tag: string
  detail: string
}

const transferDayPattern = /\b(drive|transfer|travel|return|continue|journey|head)\b/i

const itineraryInsightRules: ItineraryInsightRule[] = [
  {
    pattern: /\b(arrive|arrival|check-?in|briefing|overnight)\b/i,
    tag: 'Arrival',
    detail:
      'Arrival support is paced gently so you can settle in, meet your guide, and prepare comfortably for the safari ahead.',
  },
  {
    pattern: /\b(drive|transfer|travel|return|continue|journey)\b/i,
    tag: 'Scenic Transfer',
    detail:
      'Longer road sections are usually broken up with comfort stops, photo pauses, and local commentary from your guide.',
  },
  {
    pattern: /\b(game drive|wildlife tracking|big 5|tree-climbing lions|lions?)\b/i,
    tag: 'Game Drive',
    detail:
      'Wildlife viewing is typically scheduled for the best light and animal activity window, with flexibility for sightings on the route.',
  },
  {
    pattern: /\b(boat|cruise|canoe|nile|kazinga)\b/i,
    tag: 'Water Safari',
    detail:
      'Water-based activities add a slower viewing angle for birds, shoreline wildlife, and scenic photography.',
  },
  {
    pattern: /\b(gorilla|habituation)\b/i,
    tag: 'Gorilla Experience',
    detail:
      'Permit timing, ranger briefings, and porter support are coordinated carefully around the primate trekking session.',
  },
  {
    pattern: /\b(chimp|chimpanzee)\b/i,
    tag: 'Chimpanzee Tracking',
    detail:
      'Forest activity timing is planned around ranger briefings and the most active period for chimpanzee movement.',
  },
  {
    pattern: /\b(golden monkey)\b/i,
    tag: 'Golden Monkeys',
    detail:
      'Golden monkey tracking usually moves at a light-to-moderate pace with time for photography in the bamboo zone.',
  },
  {
    pattern: /\b(community|cultural|village|market|craft)\b/i,
    tag: 'Community Visit',
    detail:
      'Community experiences are generally flexible and can be adjusted based on your energy level after the main activity.',
  },
  {
    pattern: /\b(falls|waterfall|viewpoint|top of the falls|crater lakes)\b/i,
    tag: 'Scenic Stop',
    detail:
      'Expect short guided walks, panoramic viewpoints, and time to slow down for the scenery before continuing.',
  },
  {
    pattern: /\b(wetland|walk|walking safari|trail|hike|hot springs|foothills)\b/i,
    tag: 'Guided Walk',
    detail:
      'Comfortable walking shoes and a light daypack are useful for these slower paced, guide-led nature segments.',
  },
  {
    pattern: /\b(relaxed|downtime|recovery|lodge|lakeside|sunset)\b/i,
    tag: 'Lodge Time',
    detail:
      'The lighter pacing leaves space for rest, sunset views, and optional lodge-based experiences if you want them.',
  },
  {
    pattern: /\b(rhino)\b/i,
    tag: 'Rhino Tracking',
    detail:
      'Rhino tracking sessions are usually timed as guided walks before the road journey continues to the next park area.',
  },
]

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const formatLocationLabel = (value: string) => value.replace(/,\s*Uganda$/i, '').trim()

const buildStopAliases = (stop: string) => {
  const cleanStop = formatLocationLabel(stop)
  const segments = cleanStop
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
  const aliases = new Set<string>(segments)

  for (const segment of segments) {
    const simplified = segment
      .replace(/\b(national park|sector|sanctuary|region|mountains)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (simplified.length >= 4) {
      aliases.add(simplified)
    }
  }

  return [...aliases]
}

function findMentionedStops(headline: string, routeStops: string[]): string[] {
  const normalizedHeadline = normalizeSearchText(headline)

  return routeStops.filter((stop) =>
    buildStopAliases(stop).some((alias) => {
      const normalizedAlias = normalizeSearchText(alias)
      return normalizedAlias.length >= 4 && normalizedHeadline.includes(normalizedAlias)
    }),
  )
}

function parseItineraryStep(step: string, index: number) {
  const match = step.match(/^(Day\s+\d+):\s*(.+)$/i)

  if (match) {
    return {
      dayLabel: match[1],
      headline: match[2].trim(),
    }
  }

  return {
    dayLabel: `Day ${index + 1}`,
    headline: step.trim(),
  }
}

function buildRouteDetail(
  isTransferDay: boolean,
  baseLocation: string,
  overnightLocation: string,
  mentionedStops: string[],
) {
  const formattedBase = formatLocationLabel(baseLocation)
  const formattedOvernight = formatLocationLabel(overnightLocation)
  const formattedStops = mentionedStops.map(formatLocationLabel).filter(Boolean)

  if (isTransferDay && formattedBase && formattedOvernight && formattedBase !== formattedOvernight) {
    return `Route focus: ${formattedBase} to ${formattedOvernight}.`
  }

  if (formattedStops.length > 1) {
    return `Activity focus: ${formattedStops.join(' and ')}.`
  }

  if (formattedBase) {
    return `Base location: ${formattedBase}.`
  }

  return 'The day is paced around the main activity block and the best local timing advice from your guide.'
}

function buildGeneratedItineraryDays(
  itineraryOutline: string[],
  routeStops: string[],
): TourItineraryDay[] {
  let lastOvernight = routeStops[0] ?? ''

  return itineraryOutline.map((step, index) => {
    const { dayLabel, headline } = parseItineraryStep(step, index)
    const mentionedStops = findMentionedStops(headline, routeStops)
    const isTransferDay = transferDayPattern.test(headline)
    const fallbackStop = routeStops[Math.min(index, Math.max(routeStops.length - 1, 0))] ?? ''
    const baseLocation =
      isTransferDay
        ? lastOvernight || mentionedStops[0] || fallbackStop
        : mentionedStops[0] || lastOvernight || fallbackStop
    const overnightLocation =
      isTransferDay
        ? mentionedStops[mentionedStops.length - 1] ||
          routeStops[Math.min(index + 1, Math.max(routeStops.length - 1, 0))] ||
          baseLocation
        : mentionedStops[mentionedStops.length - 1] || baseLocation
    const matchedRules = itineraryInsightRules.filter((rule) => rule.pattern.test(headline))
    const details = Array.from(
      new Set(
        [
          buildRouteDetail(isTransferDay, baseLocation, overnightLocation, mentionedStops),
          ...matchedRules.map((rule) => rule.detail),
          overnightLocation
            ? `Overnight is usually planned in or near ${formatLocationLabel(overnightLocation)}.`
            : null,
          'Daily timing can stay flexible around permits, weather, road conditions, and strong wildlife sightings.',
        ].filter((value): value is string => Boolean(value)),
      ),
    ).slice(0, 4)
    const highlights = Array.from(new Set(matchedRules.map((rule) => rule.tag))).slice(0, 3)

    lastOvernight = overnightLocation || baseLocation

    return {
      id: `${dayLabel.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      dayLabel,
      headline,
      details,
      highlights,
      baseLocation: formatLocationLabel(baseLocation),
      overnightLocation: formatLocationLabel(overnightLocation || baseLocation),
    }
  })
}

function parseDurationDays(duration: string) {
  const match = duration.match(/\d+/)
  return Number(match?.[0] ?? 0)
}

function buildKeywordText(tour: Tour, detail: TourDetailContent) {
  return [
    tour.title,
    tour.summary,
    detail.overview,
    detail.bestFor,
    ...detail.highlights,
    ...detail.itineraryOutline,
  ]
    .join(' ')
    .toLowerCase()
}

function buildCompactRouteStops(routeStops: string[]) {
  return routeStops
    .map(formatLocationLabel)
    .filter((stop) => Boolean(stop) && !/^uganda$/i.test(stop))
    .map((stop) =>
      stop
        .replace(/\bNational Park\b/gi, '')
        .replace(/\bWetland Sanctuary\b/gi, 'Wetland')
        .replace(/\bSanctuary\b/gi, '')
        .replace(/\bSector\b/gi, 'Sector')
        .replace(/\s{2,}/g, ' ')
        .trim(),
    )
}

function buildRouteEndpoints(routeStops: string[]) {
  const formattedStops = buildCompactRouteStops(routeStops)
  const firstStop = formattedStops[0] ?? 'Entebbe'
  const lastStop = formattedStops[formattedStops.length - 1] ?? firstStop

  if (firstStop === lastStop) {
    return `${firstStop} return`
  }

  return `${firstStop} to ${lastStop}`
}

function buildRouteStyle(tour: Tour, detail: TourDetailContent) {
  const keywordText = buildKeywordText(tour, detail)
  const durationDays = parseDurationDays(tour.duration)
  const hasGorilla = keywordText.includes('gorilla')
  const hasChimp = keywordText.includes('chimp')
  const hasWildlife = /(wildlife|game drive|big 5|lion|boat safari|kazinga|murchison|queen elizabeth|kidepo)/.test(
    keywordText,
  )
  const hasCulture = /(culture|cultural|community|village|batwa|market)/.test(keywordText)
  const hasGoldenMonkey = keywordText.includes('golden monkey')
  const hasHabituation = keywordText.includes('habituation')
  const hasLakeStay = /(bunyonyi|lake mburo|lake victoria|canoe|lakeside)/.test(keywordText)

  if (hasHabituation && hasGorilla) {
    return 'Specialist gorilla permit itinerary focused on one major forest experience.'
  }

  if (hasHabituation && hasChimp) {
    return 'Specialist chimp permit itinerary with deeper time in Kibale forest.'
  }

  if (hasCulture && hasWildlife) {
    return 'Road safari blending classic wildlife circuits with community and cultural encounters.'
  }

  if (hasGorilla && hasChimp && hasWildlife) {
    return 'Classic Uganda road safari mixing primates, game drives, and boat-based wildlife viewing.'
  }

  if (hasGorilla && hasGoldenMonkey) {
    return 'Short highland primate safari centered on Mgahinga and the Kisoro region.'
  }

  if (hasGorilla && hasLakeStay) {
    return 'Compact primate and lake itinerary combining trekking with scenic downtime.'
  }

  if (hasChimp && hasWildlife) {
    return 'Western Uganda safari built around chimp tracking and strong savannah wildlife sessions.'
  }

  if (durationDays >= 20) {
    return 'Extended road safari covering multiple Uganda regions with deeper destination immersion.'
  }

  return 'Private road safari with lodge overnights, guided activities, and flexible daily pacing.'
}

function buildTourPace(duration: string) {
  const durationDays = parseDurationDays(duration)

  if (durationDays <= 3) {
    return 'Very focused, built around one permit-led highlight.'
  }

  if (durationDays <= 4) {
    return 'Compact trip with early departures and efficient road transfers.'
  }

  if (durationDays <= 8) {
    return 'Short safari pace with active days and limited downtime.'
  }

  if (durationDays <= 12) {
    return 'Balanced multi-park pace with a good mix of activities and lodge time.'
  }

  if (durationDays <= 18) {
    return 'Comfortable long-route pace with more wildlife time and scenic stopovers.'
  }

  return 'Expedition pace with deep coverage, longer road sections, and broader regional variety.'
}

function buildMainFocus(detail: TourDetailContent) {
  return detail.highlights.length
    ? detail.highlights.join(', ')
    : 'Custom safari planning, guided activities, and flexible route support.'
}

function buildMainRoute(routeStops: string[]) {
  const filteredStops = buildCompactRouteStops(routeStops).filter((stop) => !/^Entebbe$/i.test(stop))
  const uniqueStops = Array.from(new Set(filteredStops)).slice(0, 5)

  return uniqueStops.length > 0 ? uniqueStops.join(' / ') : 'Uganda safari route tailored to your dates.'
}

function buildPermitPlanning(tour: Tour, detail: TourDetailContent) {
  const keywordText = buildKeywordText(tour, detail)
  const hasGorilla = keywordText.includes('gorilla')
  const hasChimp = keywordText.includes('chimp')
  const hasHabituation = keywordText.includes('habituation')

  if (hasHabituation && hasGorilla) {
    return 'Gorilla habituation permits are limited and should be secured as early as possible.'
  }

  if (hasHabituation && hasChimp) {
    return 'Chimp habituation permits have limited availability and are best reserved ahead of travel.'
  }

  if (hasGorilla && hasChimp) {
    return 'Gorilla and chimp tracking permits are best confirmed early, especially for peak travel months.'
  }

  if (hasGorilla) {
    return 'Gorilla permits should be booked early because daily trekking slots are strictly limited.'
  }

  if (hasChimp) {
    return 'Chimp trekking or forest activity permits are easier to schedule once travel dates are fixed.'
  }

  return 'Park entries and non-permit activities can usually be sequenced flexibly around your travel dates.'
}

function buildGeneratedSnapshot(
  tour: Tour,
  detail: TourDetailContent,
  routeStops: string[],
): TourSnapshot {
  return {
    startEnd: buildRouteEndpoints(routeStops),
    routeStyle: buildRouteStyle(tour, detail),
    pace: buildTourPace(tour.duration),
    mainFocus: buildMainFocus(detail),
    mainRoute: buildMainRoute(routeStops),
    permitPlanning: buildPermitPlanning(tour, detail),
  }
}

function buildGeneratedPlanningNotes(
  tour: Tour,
  detail: TourDetailContent,
  routeStops: string[],
): string[] {
  const keywordText = buildKeywordText(tour, detail)
  const durationDays = parseDurationDays(tour.duration)
  const notes = new Set<string>()
  const hasForestPrimateDay = /(gorilla|chimp|golden monkey|habituation)/.test(keywordText)
  const hasBoatOrWetlandDay = /(boat|cruise|canoe|wetland|nile|kazinga)/.test(keywordText)
  const hasHighlandStops = /(bwindi|mgahinga|bunyonyi|sipi|rwenzori|kisoro)/.test(
    routeStops.join(' ').toLowerCase(),
  )

  if (durationDays >= 8) {
    notes.add(
      'This itinerary is primarily road-based, so some mornings start early to balance transfer time with the best wildlife viewing hours.',
    )
  } else {
    notes.add(
      'This short route moves quickly, so keeping luggage light and staying flexible on departure times helps the trip flow better.',
    )
  }

  if (hasForestPrimateDay) {
    notes.add(
      'Permit-led primate activities usually begin with a ranger briefing, and walking time can vary depending on where the animals move that day.',
    )
  }

  if (hasBoatOrWetlandDay) {
    notes.add(
      'Boat safaris and wetland activities can swap between morning and afternoon depending on park scheduling, weather, and water conditions.',
    )
  }

  if (hasHighlandStops) {
    notes.add(
      'Cool mornings, rain-ready layers, and comfortable walking shoes are especially helpful around the highland and forest sections of the route.',
    )
  }

  notes.add(buildPermitPlanning(tour, detail))

  return [...notes].slice(0, 4)
}

const tourDetailContent: Record<string, TourDetailContent> = {
  '10-days-best-uganda': {
    overview:
      'This 10-day itinerary is designed to balance primate trekking, classic game viewing, and scenic water experiences without rushing between parks.',
    highlights: ['Gorilla trekking', 'Savannah game drives', 'Boat safari experience'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe, welcome briefing, and check-in near Lake Victoria.',
      'Day 2: Drive to Murchison Falls via Ziwa Rhino Sanctuary; settle in at the lodge.',
      'Day 3: Morning game drive in the northern sector; afternoon Nile boat safari to the falls base.',
      'Day 4: Visit the top of the falls and transfer to the Kibale region.',
      'Day 5: Chimpanzee trekking in Kibale; Bigodi wetland or community walk.',
      'Day 6: Transfer to Queen Elizabeth National Park; sunset game drive.',
      'Day 7: Morning game drive; afternoon Kazinga Channel boat cruise.',
      'Day 8: Ishasha sector for tree-climbing lions; continue to Bwindi.',
      'Day 9: Gorilla trekking experience; optional village or craft market visit.',
      'Day 10: Lake Mburo stop for a short game drive or walk; return to Entebbe.',
    ],
    includes: ['Ground transport and driver-guide', 'Accommodation and meals as selected', 'Planned park activity coordination'],
    bestFor: 'Travelers who want a complete first-time Uganda safari with balanced pacing.',
    routeStops: [
      'Entebbe, Uganda',
      'Ziwa Rhino Sanctuary, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Bwindi Impenetrable National Park, Uganda',
  },
  '12-days-best-uganda': {
    overview:
      'A longer version of the Uganda highlights route with more time in key parks, reduced transfer pressure, and stronger wildlife observation windows.',
    highlights: ['Extended park time', 'Primate and wildlife combination', 'Flexible pacing for photography'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe, briefing, and overnight.',
      'Day 2: Drive to Murchison Falls via Ziwa Rhino Sanctuary.',
      'Day 3: Game drive in Murchison; afternoon Nile boat safari.',
      'Day 4: Top of the falls walk and a relaxed lodge afternoon.',
      'Day 5: Transfer to the Kibale and Fort Portal region with scenic stopovers.',
      'Day 6: Chimpanzee trekking and Bigodi wetland visit.',
      'Day 7: Transfer to Queen Elizabeth; crater lakes or evening game drive.',
      'Day 8: Morning game drive and Kazinga Channel boat cruise.',
      'Day 9: Ishasha sector game drive; continue to Bwindi.',
      'Day 10: Gorilla trekking and community walk.',
      'Day 11: Lake Bunyonyi canoe ride and lakeside downtime.',
      'Day 12: Lake Mburo walking safari; return to Entebbe.',
    ],
    includes: ['Tour planning and route optimization', 'Accommodation setup by budget class', 'On-ground trip coordination and support'],
    bestFor: 'Travelers preferring a less rushed itinerary with additional wildlife time.',
    routeStops: [
      'Entebbe, Uganda',
      'Ziwa Rhino Sanctuary, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Fort Portal, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Murchison Falls National Park, Uganda',
  },
  '17-days-wildlife-culture': {
    overview:
      'A comprehensive safari that combines major wildlife destinations with curated cultural interactions for a broader Uganda experience.',
    highlights: ['Multi-park wildlife circuit', 'Community and culture encounters', 'Long-form safari immersion'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe and overnight near the lake.',
      'Day 2: Kampala city and cultural orientation, markets, and craft stops.',
      'Day 3: Drive to Murchison Falls via Ziwa Rhino Sanctuary.',
      'Day 4: Morning game drive and afternoon Nile boat safari.',
      'Day 5: Top of the falls walk and a community encounter near the park.',
      'Day 6: Transfer to Kibale with scenic tea estate views.',
      'Day 7: Chimpanzee trekking in Kibale National Park.',
      'Day 8: Bigodi wetland walk plus local community visit.',
      'Day 9: Transfer to Queen Elizabeth National Park; evening game drive.',
      'Day 10: Morning game drive and Kazinga Channel cruise.',
      'Day 11: Ishasha sector game drive for tree-climbing lions.',
      'Day 12: Transfer to Bwindi with a cultural stopover en route.',
      'Day 13: Gorilla trekking and relaxed lodge evening.',
      'Day 14: Batwa community experience or guided village walk.',
      'Day 15: Lake Bunyonyi canoe ride and island viewpoints.',
      'Day 16: Lake Mburo game drive or walking safari.',
      'Day 17: Return to Entebbe for departure.',
    ],
    includes: ['Itinerary customization support', 'Coordinated wildlife and cultural activities', 'Travel logistics across all route segments'],
    bestFor: 'Travelers wanting both wildlife depth and cultural context in one journey.',
    routeStops: [
      'Entebbe, Uganda',
      'Kampala, Uganda',
      'Ziwa Rhino Sanctuary, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Queen Elizabeth National Park, Uganda',
  },
  '25-days-uganda': {
    overview:
      'This long-range itinerary explores Uganda in depth, giving room for repeat game drives, optional specialist experiences, and slower transitions.',
    highlights: ['Deep-country safari coverage', 'Extended wildlife observation windows', 'Custom pacing and optional add-ons'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe and settle in with a welcome briefing.',
      'Day 2: Entebbe and Kampala orientation with markets and cultural stops.',
      'Day 3: Drive to Jinja for the Source of the Nile and lakeside downtime.',
      'Day 4: Transfer to Sipi Falls for a guided hike and scenic viewpoints.',
      'Day 5: Travel to Kidepo Valley National Park with a long scenic drive.',
      'Day 6: Kidepo game drive through open savannah plains.',
      'Day 7: Cultural visit near Kidepo and an evening wildlife drive.',
      'Day 8: Travel south toward Murchison Falls with rest stops en route.',
      'Day 9: Murchison Falls game drive and wildlife tracking.',
      'Day 10: Nile boat safari and the top of the falls viewpoint.',
      'Day 11: Transfer to Kibale and Fort Portal region.',
      'Day 12: Chimpanzee trekking in Kibale National Park.',
      'Day 13: Bigodi wetland walk and crater lakes drive.',
      'Day 14: Semuliki day trip for hot springs and forest trails.',
      'Day 15: Rwenzori foothills nature walk and scenic recovery time.',
      'Day 16: Transfer to Queen Elizabeth National Park; evening game drive.',
      'Day 17: Morning game drive and Kazinga Channel boat cruise.',
      'Day 18: Ishasha sector game drive for tree-climbing lions.',
      'Day 19: Transfer to Bwindi with highland scenery.',
      'Day 20: Gorilla trekking and relaxed lodge evening.',
      'Day 21: Community visit and forest walk near Bwindi.',
      'Day 22: Lake Bunyonyi canoe ride and lakeside relaxation.',
      'Day 23: Transfer to Lake Mburo National Park.',
      'Day 24: Walking safari and optional afternoon game drive in Lake Mburo.',
      'Day 25: Return to Entebbe for departure or buffer day.',
    ],
    includes: ['End-to-end itinerary management', 'Long-stay logistics coordination', 'Adaptive planning for route changes'],
    bestFor: 'Explorers, photographers, and repeat safari guests seeking maximum coverage.',
    routeStops: [
      'Entebbe, Uganda',
      'Kampala, Uganda',
      'Jinja, Uganda',
      'Sipi Falls, Uganda',
      'Kidepo Valley National Park, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Fort Portal, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Semuliki National Park, Uganda',
      'Rwenzori Mountains National Park, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Uganda',
  },
  '18-days-uganda': {
    overview:
      'An extended safari built for travelers who want additional activity days in key destinations while maintaining comfortable travel flow.',
    highlights: ['Extended game drive blocks', 'Multiple primate sessions', 'Balanced travel and rest rhythm'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe, briefing, and overnight.',
      'Day 2: Drive to Murchison Falls via Ziwa Rhino Sanctuary.',
      'Day 3: Morning game drive and afternoon Nile boat safari.',
      'Day 4: Top of the falls visit and relaxed lodge time.',
      'Day 5: Transfer to Kibale and Fort Portal region.',
      'Day 6: Chimpanzee trekking in Kibale National Park.',
      'Day 7: Bigodi wetland walk and crater lakes visit.',
      'Day 8: Semuliki day trip for hot springs and forest trails.',
      'Day 9: Transfer to Queen Elizabeth National Park; evening game drive.',
      'Day 10: Morning game drive and Kazinga Channel boat cruise.',
      'Day 11: Ishasha sector game drive for tree-climbing lions.',
      'Day 12: Transfer to Bwindi with scenic highland views.',
      'Day 13: Gorilla trekking and relaxed lodge evening.',
      'Day 14: Community walk or forest trail near Bwindi.',
      'Day 15: Lake Bunyonyi canoe ride and lakeside downtime.',
      'Day 16: Transfer to Lake Mburo National Park.',
      'Day 17: Game drive or walking safari in Lake Mburo.',
      'Day 18: Return to Entebbe for departure.',
    ],
    includes: ['Ground logistics and scheduling', 'Activity booking sequence management', 'Guided support throughout itinerary'],
    bestFor: 'Travelers who want a premium-feel safari timeline with room to breathe.',
    routeStops: [
      'Entebbe, Uganda',
      'Ziwa Rhino Sanctuary, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Fort Portal, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Semuliki National Park, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Kibale National Park, Uganda',
  },
  '10-days-gorillas-chimps-big5': {
    overview:
      'A high-demand route combining Uganda\'s headline experiences: gorilla trekking, chimpanzee tracking, and Big 5 wildlife viewing.',
    highlights: ['Gorilla trekking permit route', 'Chimpanzee tracking activity', 'Big game safari sessions'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe, briefing, and overnight.',
      'Day 2: Drive to Murchison Falls via Ziwa Rhino Sanctuary.',
      'Day 3: Morning game drive and afternoon Nile boat safari.',
      'Day 4: Visit the top of the falls and transfer to Kibale region.',
      'Day 5: Chimpanzee trekking and Bigodi wetland walk.',
      'Day 6: Transfer to Queen Elizabeth National Park; evening game drive.',
      'Day 7: Morning game drive and Kazinga Channel boat cruise.',
      'Day 8: Ishasha sector game drive; continue to Bwindi.',
      'Day 9: Gorilla trekking experience and community visit.',
      'Day 10: Lake Mburo stop for a short game drive; return to Entebbe.',
    ],
    includes: ['Core itinerary coordination', 'Primate-activity scheduling support', 'Accommodation and transfer logistics'],
    bestFor: 'Travelers wanting top Uganda experiences in a single 10-day plan.',
    routeStops: [
      'Entebbe, Uganda',
      'Ziwa Rhino Sanctuary, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Bwindi Impenetrable National Park, Uganda',
  },
  '4-days-gorillas-golden-monkeys': {
    overview:
      'A short primate-focused journey optimized for limited time, centered around gorilla and golden monkey encounters.',
    highlights: ['Gorilla trekking focus', 'Golden monkey activity option', 'Short-duration efficiency'],
    itineraryOutline: [
      'Day 1: Drive from Entebbe to the Mgahinga or Kisoro base area.',
      'Day 2: Gorilla trekking in Mgahinga and lodge recovery time.',
      'Day 3: Golden monkey tracking and a local community walk.',
      'Day 4: Return drive to Entebbe for departure.',
    ],
    includes: ['Fast-track route planning', 'Primate trekking schedule support', 'Compact transfer logistics'],
    bestFor: 'Travelers with limited days who prioritize primate experiences.',
    routeStops: [
      'Entebbe, Uganda',
      'Kisoro, Uganda',
      'Mgahinga Gorilla National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Mgahinga Gorilla National Park, Uganda',
  },
  '4-days-bunyonyi-wildlife': {
    overview:
      'A compact itinerary blending primate activity with scenic lake relaxation and selected wildlife viewing.',
    highlights: ['Gorilla trekking component', 'Lake Bunyonyi scenic stay', 'Short wildlife extension'],
    itineraryOutline: [
      'Day 1: Drive from Entebbe to Bwindi with a route briefing en route.',
      'Day 2: Gorilla trekking in Bwindi and relaxed lodge evening.',
      'Day 3: Lake Bunyonyi canoe ride and scenic lake viewpoints.',
      'Day 4: Return to Entebbe with a short Lake Mburo wildlife stop if time allows.',
    ],
    includes: ['Short-trip activity coordination', 'Lake-region accommodation planning', 'Round-trip transfer support'],
    bestFor: 'Travelers seeking a quick mix of adventure and scenic downtime.',
    routeStops: [
      'Entebbe, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Lake Bunyonyi, Uganda',
  },
  '4-days-bwindi-gorilla-fly-in': {
    overview:
      'A 3-night fly-in gorilla safari based in Bwindi, designed for travelers who want fast access to gorilla trekking, a meaningful Batwa heritage experience, and lodge time in the Rushaga sector.',
    highlights: ['Fly-in access to Bwindi', 'Uganda gorilla trekking', 'Batwa cultural experience'],
    itineraryOutline: [
      'Day 1: Fly from Entebbe to Bwindi, transfer to Rushaga Gorilla Lodge, and optional community visit.',
      'Day 2: Gorilla trekking in Bwindi after the morning ranger briefing.',
      'Day 3: Full Batwa experience tour with forest walking, heritage stories, and cultural performances.',
      'Day 4: Early transfer to Kisoro Airstrip for the return flight to Entebbe.',
    ],
    itineraryDays: [
      {
        id: 'day-1-bwindi-fly-in',
        dayLabel: 'Day 1',
        headline: 'Fly to Bwindi and settle in at Rushaga Gorilla Lodge',
        details: [
          'After breakfast, take a morning domestic flight from Entebbe to the Kisoro area for your Bwindi safari.',
          'On arrival, you are met at the airstrip and transferred to Rushaga Gorilla Lodge in the southern sector of Bwindi Impenetrable National Park.',
          'The rest of the day can stay relaxed at the lodge, with the option of an afternoon community visit if flight timing allows.',
          'The flight is about 1 hour and 50 minutes, followed by dinner and overnight at Rushaga Gorilla Lodge on full board.',
        ],
        highlights: ['Fly-in transfer', 'Lodge relaxation', 'Optional community visit'],
        baseLocation: 'Entebbe',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-2-gorilla-trek',
        dayLabel: 'Day 2',
        headline: 'Gorilla trekking in Bwindi Impenetrable National Park',
        details: [
          'Your driver-guide transfers you from the lodge to the briefing point in time for the 7:30 a.m. ranger orientation.',
          'Uganda Wildlife Authority rangers explain park rules, trekking conduct, and how to interact respectfully with the gorillas and surrounding environment.',
          'The trek itself can take anywhere from about 30 minutes to 8 hours depending on where the gorilla family is found that day.',
          'After the trek, return to Rushaga Gorilla Lodge for rest, meals, and overnight.',
        ],
        highlights: ['Ranger briefing', 'Gorilla trekking', 'Forest hiking'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-3-batwa-experience',
        dayLabel: 'Day 3',
        headline: 'Batwa cultural and forest experience',
        details: [
          'Spend the day with Batwa guides learning how the Batwa traditionally lived, hunted, gathered, and used medicinal plants in the Bwindi forest.',
          'The experience includes guided walking in the rainforest, storytelling, songs, dances, and insight into Batwa heritage passed through generations.',
          'You may also join a mock hunting activity and try traditional tools such as the Batwa bow and arrow.',
          'Return to Rushaga Gorilla Lodge afterward for dinner and another overnight stay.',
        ],
        highlights: ['Batwa heritage', 'Rainforest walk', 'Cultural performance'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-4-return-entebbe',
        dayLabel: 'Day 4',
        headline: 'Transfer to Kisoro Airstrip and fly back to Entebbe',
        details: [
          'After an early breakfast, usually around 5:30 a.m., transfer back toward Kisoro Airstrip for the morning departure.',
          'The return domestic flight to Entebbe takes about 1 hour and 50 minutes.',
          'This flight marks the end of your Bwindi gorilla safari package.',
        ],
        highlights: ['Early transfer', 'Domestic return flight', 'End of safari'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Entebbe return via Kisoro Airstrip',
      routeStyle:
        'Fly-in Bwindi safari with short ground transfers and a lodge-based stay in the Rushaga sector.',
      pace:
        'Compact but comfortable, with one gorilla permit day and one full cultural forest experience.',
      mainFocus:
        'Gorilla trekking, Batwa heritage, and faster access to Bwindi without the long road journey.',
      mainRoute: 'Entebbe / Kisoro Airstrip / Rushaga / Bwindi',
      permitPlanning:
        'Gorilla permits and domestic flight seats should be secured early because both can fill quickly.',
    },
    planningNotes: [
      'This package works especially well for travelers who want to spend more time in Bwindi and less time on the road.',
      'Domestic flight luggage limits are usually lighter than road safari packing, so soft-sided bags are the easiest option.',
      'Gorilla trekking is permit-led and physically variable, with walking time changing according to gorilla movement and trail conditions.',
      'If arrival timing is favorable, the optional community experience can be added on the first afternoon before the trek.',
    ],
    includes: [
      'Transfers in a customized safari vehicle',
      'Full-board accommodation for 3 nights / 4 days',
      'All activities mentioned in the itinerary',
      '2 gorilla permits',
      'Bottled water on safari',
      'Airstrip transfers',
      'Guide, driver, and vehicle support for 3 days',
      'Batwa experience tour',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want a shorter Bwindi gorilla safari with domestic flights, comfortable lodge time, and a deeper cultural add-on.',
    routeStops: [
      'Entebbe, Uganda',
      'Kisoro Airstrip, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Batwa Experience Trail, Bwindi Impenetrable National Park, Uganda',
      'Kisoro Airstrip, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
  },
  '4-days-bwindi-lake-mutanda': {
    overview:
      'This 3-night safari starts in Kigali, crosses into southwestern Uganda for gorilla trekking in Bwindi, and finishes with a scenic Lake Mutanda stay before the outbound flight connection to Entebbe.',
    highlights: ['Kigali to Bwindi road transfer', 'Ultimate gorilla trekking experience', 'Lake Mutanda and Batwa trail'],
    itineraryOutline: [
      'Day 1: Transfer from Kigali to Bwindi and overnight at Rushaga Gorilla Lodge.',
      'Day 2: Gorilla trekking in Bwindi after the morning ranger briefing.',
      'Day 3: Transfer to Lake Mutanda, enjoy the Mgahinga Batwa Forest Trail, and optional evening canoe experience.',
      'Day 4: Transfer to Kisoro Airstrip for the flight connection toward Entebbe.',
    ],
    itineraryDays: [
      {
        id: 'day-1-kigali-to-bwindi',
        dayLabel: 'Day 1',
        headline: 'Transfer from Kigali to Bwindi Impenetrable Forest National Park',
        details: [
          'After arrival at Kigali International Airport or pickup from your Kigali hotel, meet your safari representative and driver-guide for the start of the trip.',
          'Continue by road toward Bwindi Impenetrable National Park, a journey that usually takes about 5 to 6 hours depending on border formalities and road conditions.',
          'Arrive in the Rushaga sector in the evening for dinner and overnight at Rushaga Gorilla Lodge.',
        ],
        highlights: ['Airport pickup', 'Cross-border transfer', 'Rushaga lodge stay'],
        baseLocation: 'Kigali',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-2-bwindi-gorillas',
        dayLabel: 'Day 2',
        headline: 'Ultimate gorilla trekking experience in Bwindi',
        details: [
          'After breakfast around 7:00 a.m., drive the short distance from the lodge to the briefing point, usually about 5 minutes away.',
          'Ranger guides take over after the orientation and lead the trek in search of the gorilla family assigned for the day.',
          'Once the gorillas are located, you spend one hour observing them before starting the return hike.',
          'The total trek may take about 4 to 8 hours depending on where the gorillas are found, then return to Rushaga Gorilla Lodge for overnight.',
        ],
        highlights: ['Ranger-guided trek', 'One-hour gorilla viewing', 'Full forest day'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-3-lake-mutanda',
        dayLabel: 'Day 3',
        headline: 'Transfer to Lake Mutanda and explore the Mgahinga Batwa Forest Trail',
        details: [
          'After breakfast, drive through the Nkuringo hills toward Kisoro and continue on to Lake Mutanda.',
          'Check in at Lake Mutanda Resort before heading out for the Mgahinga Batwa Forest Trail, which generally takes 3 to 4 hours.',
          'After a late lunch, you can relax or add an evening canoe experience on Lake Mutanda for up to about 2 hours, depending on your interest.',
          'Return to Lake Mutanda Resort for dinner and overnight.',
        ],
        highlights: ['Scenic hill drive', 'Batwa forest trail', 'Lake canoe experience'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Lake Mutanda Resort',
      },
      {
        id: 'day-4-kisoro-airstrip',
        dayLabel: 'Day 4',
        headline: 'Transfer to Kisoro Airstrip for the flight toward Entebbe',
        details: [
          'After breakfast around 8:00 a.m., check out and drive the short distance from Lake Mutanda to Kisoro Airstrip.',
          'Board the scheduled domestic flight connection toward Entebbe, with timing subject to the operating airline schedule.',
          'On arrival near Entebbe, your guide handles the final transfer to Entebbe Airport for departure.',
        ],
        highlights: ['Airstrip transfer', 'Domestic flight connection', 'Airport drop-off'],
        baseLocation: 'Lake Mutanda Resort',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Kigali to Entebbe via Kisoro Airstrip',
      routeStyle:
        'Cross-border gorilla safari combining a road transfer into Bwindi with a scenic Lake Mutanda overnight and air exit.',
      pace:
        'Compact but active, with one long transfer day, one full gorilla day, and one scenic-cultural excursion day.',
      mainFocus:
        'Bwindi gorilla trekking, Lake Mutanda scenery, and the Mgahinga Batwa forest experience.',
      mainRoute: 'Kigali / Rushaga / Bwindi / Lake Mutanda / Kisoro / Entebbe',
      permitPlanning:
        'Gorilla permits should be booked early, and the Kisoro to Entebbe domestic flight is best confirmed well in advance.',
    },
    planningNotes: [
      'Because the safari starts in Kigali and continues into Uganda by road, keep your passport and visa documentation accessible for the border crossing.',
      'The transfer to Lake Mutanda passes through hilly roads around Nkuringo and Kisoro, so travel times can vary with weather and road surface conditions.',
      'The Kisoro to Entebbe domestic flight schedule can change by operating date, so final departure timing should be reconfirmed before travel.',
      'This route suits travelers who want gorilla trekking plus an extra scenic lake stay instead of returning immediately after Bwindi.',
    ],
    includes: [
      'Transfers in a customized safari vehicle',
      'Full-board accommodation for 3 nights / 4 days',
      'All activities mentioned in the itinerary',
      '1 gorilla permit per person',
      'Bottled water on safari',
      'Fuel for 4 days',
      'Guide and driver fee',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers arriving through Kigali who want gorilla trekking in Bwindi plus a scenic Lake Mutanda extension before flying onward to Entebbe.',
    routeStops: [
      'Kigali International Airport, Rwanda',
      'Kigali, Rwanda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Nkuringo, Uganda',
      'Kisoro, Uganda',
      'Lake Mutanda, Uganda',
      'Mgahinga Gorilla National Park, Uganda',
      'Kisoro Airstrip, Uganda',
      'Kajjansi Airstrip, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Bwindi Impenetrable National Park, Uganda',
  },
  '4-days-entebbe-fly-in-gorilla': {
    overview:
      'This 3-night package begins with an Entebbe airport arrival stay, continues by domestic flight to Kisoro, and focuses on gorilla trekking from the Rushaga sector of Bwindi before the return connection for departure.',
    highlights: ['Entebbe airport overnight', 'Kisoro fly-in access', 'Ultimate gorilla trekking experience'],
    itineraryOutline: [
      'Day 1: Arrive at Entebbe International Airport and overnight at Karibu BB Suites.',
      'Day 2: Fly from Entebbe to Kisoro and transfer to Rushaga Gorilla Lodge in Bwindi.',
      'Day 3: Gorilla trekking in Bwindi after the morning ranger briefing.',
      'Day 4: Return to Kisoro Airstrip and fly back to Entebbe for departure.',
    ],
    itineraryDays: [
      {
        id: 'day-1-entebbe-arrival',
        dayLabel: 'Day 1',
        headline: 'Arrival at Entebbe International Airport',
        details: [
          'On arrival at Entebbe International Airport, meet your safari representative who will also serve as your guide for the journey ahead.',
          'You are transferred to Karibu BB Suites, a convenient Entebbe stay located close to the airport.',
          'The rest of the day is kept light so you can rest and prepare for the domestic transfer into southwestern Uganda on the following morning.',
        ],
        highlights: ['Airport meet and greet', 'Entebbe overnight', 'Pre-safari rest'],
        baseLocation: 'Entebbe International Airport',
        overnightLocation: 'Karibu BB Suites',
      },
      {
        id: 'day-2-fly-to-rushaga',
        dayLabel: 'Day 2',
        headline: 'Transfer to Rushaga Gorilla Lodge in Bwindi National Park',
        details: [
          'After breakfast, transfer to Entebbe for the domestic flight to Kisoro, which usually takes about 1 hour and 45 minutes.',
          'On landing at Kisoro Airstrip, continue by road for roughly 2 hours to the Rushaga sector of Bwindi Impenetrable National Park.',
          'Check in at Rushaga Gorilla Lodge, which is positioned close to the forest and well placed for the following day’s trek.',
          'Flight times and fares should be confirmed against the final operating schedule before travel.',
        ],
        highlights: ['Domestic flight', 'Kisoro arrival', 'Rushaga lodge stay'],
        baseLocation: 'Entebbe',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-3-rushaga-gorillas',
        dayLabel: 'Day 3',
        headline: 'Ultimate gorilla trekking experience in Bwindi',
        details: [
          'After breakfast around 7:00 a.m., drive the short distance to the briefing point, usually about 5 minutes from the lodge.',
          'Ranger guides then lead the trek in search of the assigned gorilla family through the forest terrain.',
          'Once the gorillas are found, you spend one hour observing them before starting the return walk.',
          'The full trekking day can take about 4 to 8 hours depending on gorilla movement, then return to Rushaga Gorilla Lodge for overnight.',
        ],
        highlights: ['Ranger briefing', 'One-hour gorilla viewing', 'Full trekking day'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-4-return-to-entebbe',
        dayLabel: 'Day 4',
        headline: 'Transfer to Kisoro Airstrip and return to Entebbe for departure',
        details: [
          'After breakfast, depart Rushaga Gorilla Lodge and transfer back to Kisoro Airstrip in time for the return domestic flight.',
          'On arrival in the Entebbe area, connect onward for snacks, refreshment, or final waiting time ahead of your international departure.',
          'This marks the end of your gorilla safari package.',
        ],
        highlights: ['Airstrip transfer', 'Return flight', 'Departure connection'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Entebbe return via Kisoro Airstrip',
      routeStyle:
        'Fly-in Bwindi gorilla package with an arrival night in Entebbe and lodge-based trekking in the Rushaga sector.',
      pace:
        'Short and efficient, with one airport night, one transfer day into Bwindi, and one full gorilla trekking day.',
      mainFocus:
        'Airport convenience, fast access to Bwindi by air, and a dedicated gorilla trekking experience.',
      mainRoute: 'Entebbe / Kisoro Airstrip / Rushaga / Bwindi / Entebbe',
      permitPlanning:
        'Gorilla permits and domestic flight seats should both be confirmed early once travel dates are fixed.',
    },
    planningNotes: [
      'This package works well for travelers arriving late into Entebbe who prefer to rest near the airport before heading to Bwindi.',
      'Domestic Kisoro flights can vary by operating date, so final schedule confirmation should be done before travel.',
      'The return-day source text included both a flight and a long road transfer; this version follows the fly-back option because it aligns with the rest of the package.',
      'Gorilla trekking remains physically variable, and walking time depends on trail conditions and where the gorillas are located that day.',
    ],
    includes: [
      'Transfers in a customized safari vehicle',
      'Full-board accommodation for 3 nights / 4 days',
      'All activities mentioned in the itinerary',
      '1 gorilla permit per person',
      'Bottled water on safari',
      'Fuel for 4 days',
      'Guide and driver fee',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want a short gorilla package from Entebbe with minimal road time and a simple airport-to-forest travel flow.',
    routeStops: [
      'Entebbe International Airport, Uganda',
      'Karibu BB Suites, Entebbe, Uganda',
      'Kisoro Airstrip, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Kisoro Airstrip, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
  },
  '4-days-bwindi-road-gorilla': {
    overview:
      'This 3-night road safari begins at Entebbe, travels overland to the Rushaga sector of Bwindi, and focuses on gorilla trekking with an extra second trekking day included for part of the group.',
    highlights: ['Entebbe to Bwindi road safari', 'Gorilla trekking in Rushaga', 'Additional second trek for selected travelers'],
    itineraryOutline: [
      'Day 1: Drive from Entebbe to Rushaga Gorilla Lodge in Bwindi via Mbarara.',
      'Day 2: Gorilla trekking in Bwindi after the morning ranger briefing.',
      'Day 3: Second gorilla trekking day for three travelers while the rest of the group remains at the lodge or nearby.',
      'Day 4: Drive back from Bwindi to Entebbe for departure.',
    ],
    itineraryDays: [
      {
        id: 'day-1-entebbe-bwindi-road',
        dayLabel: 'Day 1',
        headline: 'Transfer from Entebbe to Bwindi Impenetrable Forest National Park',
        details: [
          'On arrival at Entebbe International Airport, meet the company driver-guide who handles the journey through southwestern Uganda.',
          'Travel by road toward Bwindi Impenetrable National Park, passing flatland stretches, rural trading centers, and later the more hilly communities toward the southwest.',
          'A lunch stop is typically planned in Mbarara at Igongo Cultural Country Hotel before continuing to the Rushaga sector.',
          'Reach Rushaga Gorilla Lodge in the evening for dinner and overnight.',
        ],
        highlights: ['Airport pickup', 'Long scenic transfer', 'Rushaga lodge stay'],
        baseLocation: 'Entebbe International Airport',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-2-first-gorilla-trek',
        dayLabel: 'Day 2',
        headline: 'Ultimate gorilla trekking experience in Bwindi',
        details: [
          'After breakfast around 7:00 a.m., drive the short distance to the briefing point, usually about 5 minutes from the lodge.',
          'Ranger guides take over after the briefing and lead the trek in search of the assigned mountain gorilla family.',
          'Once the gorillas are found, you spend one hour with them before beginning the return walk through the forest.',
          'The full trekking day may take about 4 to 8 hours depending on the gorilla location, then return to Rushaga Gorilla Lodge for overnight.',
        ],
        highlights: ['Ranger briefing', 'One-hour gorilla viewing', 'Full forest trek'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-3-second-gorilla-day',
        dayLabel: 'Day 3',
        headline: 'Second gorilla trekking day for three travelers',
        details: [
          'After breakfast, three travelers from the group return to the briefing point for another gorilla trekking session in the Rushaga area.',
          'As with the previous day, the total forest time depends on where the gorillas are located and may range from a shorter walk to a full-day trekking effort.',
          'This second trek is described in the source itinerary as applying to three additional participants rather than the whole group.',
          'Overnight remains at Rushaga Gorilla Lodge.',
        ],
        highlights: ['Second trek option', 'Rushaga sector', 'Group-split activity'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-4-return-entebbe-road',
        dayLabel: 'Day 4',
        headline: 'Drive from Bwindi back to Entebbe for departure',
        details: [
          'After an early breakfast, depart Rushaga Gorilla Lodge and begin the final road transfer back toward Entebbe.',
          'This is another long travel day, generally taking most of the daylight hours depending on traffic and road conditions.',
          'Arrival is planned in time for onward departure arrangements at Entebbe International Airport.',
        ],
        highlights: ['Early departure', 'Road transfer', 'Airport drop-off'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Entebbe return by road',
      routeStyle:
        'Road-based Bwindi safari with lodge overnights in Rushaga and a gorilla-focused travel plan.',
      pace:
        'Transfer-heavy but straightforward, with two long road days surrounding one main gorilla day and an additional second trek for part of the group.',
      mainFocus:
        'Rushaga lodge stay, one standard gorilla trek for the group, and an extra second trek for three travelers.',
      mainRoute: 'Entebbe / Mbarara / Rushaga / Bwindi / Entebbe',
      permitPlanning:
        'The source package appears to include one permit for each of six travelers plus three extra permits for a second trekking day, so final permit allocation should be confirmed carefully.',
    },
    planningNotes: [
      'This package is different from the fly-in Bwindi options because it uses long overland transfers in both directions from Entebbe.',
      'The source permit wording suggests a mixed arrangement, with one standard gorilla permit per person for six travelers and three extra permits for the second trekking day.',
      'Because Day 3 applies only to three participants in the source text, the remaining travelers may need a lodge-rest or optional activity plan if traveling as one group.',
      'Road timing between Entebbe and Bwindi can vary with weather, traffic, and stop duration, so some flexibility is helpful.',
    ],
    includes: [
      'Transfers in customized safari vehicle',
      'Full-board accommodation for 3 nights / 4 days',
      '1 gorilla permit per person for 6 travelers',
      '3 additional gorilla permits for 3 travelers',
      'Bottled water on safari',
      'Fuel for 4 days from Entebbe to Bwindi and back',
      'Guide and driver fee',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want a road-based Bwindi gorilla safari from Entebbe and need a package that can accommodate an extra second gorilla trek for part of the group.',
    routeStops: [
      'Entebbe International Airport, Uganda',
      'Mbarara, Uganda',
      'Igongo Cultural Centre, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
  },
  '8-days-rwanda-uganda-adventure': {
    overview:
      'This 7-night safari combines Rwanda and Uganda in one route, starting in Kigali, continuing to Volcanoes National Park for gorilla trekking, crossing into Bwindi for a second great ape experience, and ending with classic savannah time in Lake Mburo.',
    highlights: ['Volcanoes National Park gorillas', 'Bwindi gorilla trekking', 'Lake Mburo wildlife and boat cruise'],
    itineraryOutline: [
      'Day 1: Arrive in Kigali and overnight at Peponi Living Space Hotel.',
      'Day 2: Transfer to Gorilla Volcanoes Hotel near Volcanoes National Park.',
      'Day 3: Gorilla trekking in Volcanoes National Park.',
      'Day 4: Cross via Cyanika border and continue to Rushaga Gorilla Lodge in Bwindi.',
      'Day 5: Gorilla trekking in Bwindi Impenetrable National Park.',
      'Day 6: Transfer to Lake Mburo National Park and overnight at Leopard Rest Camp.',
      'Day 7: Morning game drive and afternoon boat cruise in Lake Mburo.',
      'Day 8: Drive to Entebbe Airport with a stop at the Uganda Equator.',
    ],
    itineraryDays: [
      {
        id: 'day-1-kigali-arrival',
        dayLabel: 'Day 1',
        headline: 'Arrival in Kigali for the start of your Rwanda safari',
        details: [
          'On arrival at Kigali International Airport, meet the company representative who will welcome you and transfer you into the city.',
          'The drive through Kigali offers a first introduction to Rwanda before settling in at Peponi Living Space Hotel.',
          'The rest of the day is kept easy so you can recover from travel and prepare for the journey north the following morning.',
        ],
        highlights: ['Airport pickup', 'Kigali city arrival', 'Hotel overnight'],
        baseLocation: 'Kigali International Airport',
        overnightLocation: 'Peponi Living Space Hotel',
      },
      {
        id: 'day-2-volcanoes-transfer',
        dayLabel: 'Day 2',
        headline: 'Transfer to Gorilla Volcanoes Hotel near Volcanoes National Park',
        details: [
          'After breakfast around 8:00 a.m., depart Kigali and drive for roughly 3 hours toward Volcanoes National Park.',
          'The road journey passes through Rwanda’s well-known hilly countryside before reaching the lodge area near the park.',
          'Arrive in time to settle in at Gorilla Volcanoes Hotel for dinner and overnight.',
        ],
        highlights: ['Scenic Rwanda drive', 'Volcanoes access', 'Lodge check-in'],
        baseLocation: 'Kigali',
        overnightLocation: 'Gorilla Volcanoes Hotel',
      },
      {
        id: 'day-3-volcanoes-gorillas',
        dayLabel: 'Day 3',
        headline: 'Gorilla trekking in Volcanoes National Park',
        details: [
          'After breakfast, transfer the short distance to the briefing point for the Volcanoes National Park gorilla experience.',
          'Ranger guides lead the trek, and the time spent in the forest depends on how quickly the assigned gorilla family is located.',
          'The experience can range from a few hours to most of the day, followed by the return transfer to Gorilla Volcanoes Hotel.',
        ],
        highlights: ['Rwanda gorilla trek', 'Ranger-led forest walk', 'Volcanoes National Park'],
        baseLocation: 'Volcanoes National Park',
        overnightLocation: 'Gorilla Volcanoes Hotel',
      },
      {
        id: 'day-4-bwindi-transfer',
        dayLabel: 'Day 4',
        headline: 'Drive to Rushaga Gorilla Lodge in Bwindi via Cyanika border',
        details: [
          'After breakfast, check out and continue toward the Rwanda-Uganda border at Cyanika.',
          'After border formalities, drive onward to the Rushaga sector of Bwindi Impenetrable National Park.',
          'The cross-border drive generally takes about 2 to 3 hours after the frontier crossing, reaching Rushaga Gorilla Lodge in the evening for dinner and overnight.',
        ],
        highlights: ['Cross-border transfer', 'Cyanika border', 'Rushaga sector'],
        baseLocation: 'Volcanoes National Park',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-5-bwindi-gorillas',
        dayLabel: 'Day 5',
        headline: 'Gorilla trekking in Bwindi Forest National Park',
        details: [
          'After an early breakfast, transfer the short distance to the briefing point and begin the Uganda gorilla trekking experience.',
          'Once the gorillas are found, you spend one hour with them before returning along the forest trail.',
          'The day length depends on where the gorilla family is located, making this one of the most memorable wildlife encounters of the safari.',
          'Return to Rushaga Gorilla Lodge for overnight.',
        ],
        highlights: ['Uganda gorilla trek', 'One-hour viewing', 'Bwindi forest experience'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-6-lake-mburo-transfer',
        dayLabel: 'Day 6',
        headline: 'Transfer to Lake Mburo National Park',
        details: [
          'After breakfast, continue northward from Bwindi toward Lake Mburo National Park with your luggage packed for the next stage of the safari.',
          'The drive introduces a shift from forest and highland scenery into the open plains and rolling landscapes of southern Uganda.',
          'Arrive around lunchtime, check in, and relax at Leopard Rest Camp before dinner and overnight.',
        ],
        highlights: ['Scenic transfer', 'Savannah transition', 'Lake Mburo stay'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Leopard Rest Camp',
      },
      {
        id: 'day-7-lake-mburo-activities',
        dayLabel: 'Day 7',
        headline: 'Morning game drive and afternoon boat cruise in Lake Mburo',
        details: [
          'After an early breakfast, set out on a morning game drive looking for zebras, giraffes, and other wildlife found across the park.',
          'Return in mid-morning to rest and have lunch before the afternoon activity.',
          'Later, enjoy a boat cruise, usually beginning around 2:00 p.m., before returning to Leopard Rest Camp for overnight.',
        ],
        highlights: ['Game drive', 'Zebras and giraffes', 'Boat cruise'],
        baseLocation: 'Lake Mburo National Park',
        overnightLocation: 'Leopard Rest Camp',
      },
      {
        id: 'day-8-entebbe-return',
        dayLabel: 'Day 8',
        headline: 'Transfer from Lake Mburo to Entebbe Airport',
        details: [
          'After breakfast and check-out, begin the final road journey toward Entebbe.',
          'A lunch break is usually planned at the Uganda Equator on the Masaka-Kampala highway.',
          'Continue to Entebbe International Airport, generally reaching in the late afternoon or early evening for departure.',
        ],
        highlights: ['Equator stop', 'Road transfer', 'Airport drop-off'],
        baseLocation: 'Lake Mburo National Park',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Kigali to Entebbe',
      routeStyle:
        'Two-country safari combining Rwanda gorillas, Uganda gorillas, and a savannah finish in Lake Mburo.',
      pace:
        'Active multi-country pace with two primate trekking days, one border crossing, and a final wildlife segment in southern Uganda.',
      mainFocus:
        'Volcanoes National Park, Bwindi gorilla trekking, and Lake Mburo game viewing by road and boat.',
      mainRoute: 'Kigali / Volcanoes / Cyanika / Rushaga / Bwindi / Lake Mburo / Entebbe',
      permitPlanning:
        'Because the itinerary includes gorilla trekking in both Rwanda and Uganda, permit coverage should be confirmed carefully in the final quotation.',
    },
    planningNotes: [
      'This route crosses from Rwanda into Uganda, so passport validity and visa setup should be checked before departure.',
      'The itinerary contains gorilla trekking in both Volcanoes National Park and Bwindi, so the final package should clearly confirm whether both gorilla permits are included.',
      'Road timing can vary at the Cyanika border and on the transfer between Bwindi and Lake Mburo, so some flexibility is useful.',
      'Lake Mburo adds a lighter savannah finish after the forest-focused sections of the itinerary.',
    ],
    includes: [
      'Transfers in customized safari vehicles',
      'Full-board accommodation for 7 nights / 8 days',
      'All activities mentioned in the itinerary',
      'Bottled water on safari',
      '1 gorilla permit per person',
      'Fuel for 8 days',
      'Guide and driver fee',
      'Car hire for 8 days',
      'Park entrance fee at Lake Mburo National Park',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want a combined Rwanda and Uganda safari with gorilla trekking in both countries plus a wildlife finish in Lake Mburo.',
    routeStops: [
      'Kigali International Airport, Rwanda',
      'Kigali, Rwanda',
      'Volcanoes National Park, Rwanda',
      'Cyanika Border Post, Rwanda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Mburo National Park, Uganda',
      'Uganda Equator, Uganda',
      'Entebbe International Airport, Uganda',
    ],
    mapLocation: 'Bwindi Impenetrable National Park, Uganda',
  },
  '9-days-top-adventure-uganda': {
    overview:
      'This longer Uganda adventure combines scenic lake time, primate trekking, volcano hiking, classic savannah game drives, and chimpanzee tracking in one active route across the southwest and west of the country.',
    highlights: ['Lake Bunyonyi islands', 'Gorilla trekking and volcano hiking', 'Ishasha lions and Kibale chimpanzees'],
    itineraryOutline: [
      'Day 1: Transfer to Lake Bunyonyi and overnight at Bunyonyi Overland Resort.',
      'Day 2: Boat cruise on Lake Bunyonyi and community walk.',
      'Day 3: Transfer for gorilla trekking and overnight at Rushaga Gorilla Lodge.',
      'Day 4: Volcano hike in Mgahinga National Park.',
      'Day 5: Scenic drive to Ishasha sector in Queen Elizabeth National Park.',
      'Day 6: Morning game drive in Ishasha and lodge nature walk.',
      'Day 7: Game drive through Kasenyi or Mweya and return to Ishasha.',
      'Day 8: Transfer via Fort Portal to Kibale Forest area.',
      'Day 9: Chimpanzee trekking in Kibale Forest National Park.',
    ],
    itineraryDays: [
      {
        id: 'day-1-bunyonyi-arrival',
        dayLabel: 'Day 1',
        headline: 'Transfer to Lake Bunyonyi, the second deepest lake in Africa',
        details: [
          'After breakfast, begin the drive toward Lake Bunyonyi through southwestern Uganda with views of hillsides, cultivated slopes, and rural villages on the way.',
          'Arrive in time for check-in and lunch before settling in at Bunyonyi Overland Resort.',
          'The rest of the day is left relaxed so you can enjoy the lake setting before the activities begin.',
        ],
        highlights: ['Scenic drive', 'Lake arrival', 'Resort overnight'],
        baseLocation: 'Entebbe / Kampala',
        overnightLocation: 'Bunyonyi Overland Resort',
      },
      {
        id: 'day-2-bunyonyi-activities',
        dayLabel: 'Day 2',
        headline: 'Boat cruise to the islands of Lake Bunyonyi',
        details: [
          'Enjoy a slower morning before setting out on a boat cruise of about two hours across the lake.',
          'The cruise introduces several of the islands scattered across Lake Bunyonyi and the birdlife that rests along the shoreline and nesting areas.',
          'Later in the day, continue with a community walk toward the higher viewpoints above the lake before returning to relax at the swimming dock.',
        ],
        highlights: ['Island boat cruise', 'Community walk', 'Lake viewpoints'],
        baseLocation: 'Lake Bunyonyi',
        overnightLocation: 'Bunyonyi Overland Resort',
      },
      {
        id: 'day-3-gorilla-trek-rushaga',
        dayLabel: 'Day 3',
        headline: 'Transfer for gorilla trekking and overnight at Rushaga Gorilla Lodge',
        details: [
          'After an early breakfast, transfer from the Lake Bunyonyi area toward the gorilla trekking briefing point in the Rushaga sector.',
          'Ranger guides take over after the briefing and lead the trek in search of the mountain gorillas.',
          'Once the gorillas are found, you spend one hour with them before returning from the forest trail.',
          'The trek can take roughly 4 to 8 hours depending on where the gorilla family is located, followed by overnight at Rushaga Gorilla Lodge.',
        ],
        highlights: ['Gorilla trek', 'Rushaga sector', 'Forest hiking'],
        baseLocation: 'Lake Bunyonyi / Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-4-mgahinga-volcano',
        dayLabel: 'Day 4',
        headline: 'Volcano hike in Mgahinga Gorilla National Park',
        details: [
          'Drive to Mgahinga Gorilla National Park for a volcano hiking day with panoramic views of the Virunga landscape.',
          'Mount Gahinga is the lighter option, while Mount Muhabura is longer and more demanding, so the final choice depends on group interest and fitness.',
          'After the hike, return to Rushaga Gorilla Lodge on full board for overnight.',
        ],
        highlights: ['Volcano hike', 'Mgahinga National Park', 'Panoramic views'],
        baseLocation: 'Rushaga / Mgahinga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-5-rushaga-to-ishasha',
        dayLabel: 'Day 5',
        headline: 'Scenic drive to Ishasha sector in Queen Elizabeth National Park',
        details: [
          'After breakfast, depart Rushaga and continue north toward the Ishasha sector of Queen Elizabeth National Park.',
          'Arrive in time for lunch, check in, and rest before the late afternoon game drive.',
          'The afternoon drive focuses on wildlife in Ishasha, especially the famous tree-climbing lions and other savannah species found in the sector.',
        ],
        highlights: ['Scenic transfer', 'Ishasha game drive', 'Tree-climbing lions'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-6-ishasha-morning-drive',
        dayLabel: 'Day 6',
        headline: 'Morning tree-climbing game drive in Ishasha sector',
        details: [
          'After breakfast, head out again for an early game drive in Ishasha in search of tree-climbing lions.',
          'The drive can also reveal birds, leopards, antelope, and other mammals that may not have been seen the previous afternoon.',
          'After lunch, enjoy a quieter afternoon with a guided nature walk around the lodge area before dinner and overnight.',
        ],
        highlights: ['Morning safari', 'Birding and mammals', 'Nature walk'],
        baseLocation: 'Ishasha Sector',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-7-kasenyi-mweya-drive',
        dayLabel: 'Day 7',
        headline: 'Game drive through Kasenyi or Mweya and back to Ishasha',
        details: [
          'Begin the day with a longer wildlife drive through Queen Elizabeth National Park toward the Kasenyi or Mweya side of the park.',
          'Packed lunch helps keep the day flexible while searching for lions, leopards, and other wildlife in the broader savannah zones.',
          'Later, continue back through the park and return to Ishasha Pride Lodge for overnight.',
        ],
        highlights: ['Extended game drive', 'Packed-lunch safari day', 'Queen Elizabeth circuit'],
        baseLocation: 'Ishasha Sector',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-8-fort-portal-kibale',
        dayLabel: 'Day 8',
        headline: 'Travel through Fort Portal to the Kibale Forest region',
        details: [
          'Drive out of Queen Elizabeth toward Fort Portal, enjoying crater lakes, tea plantations, and occasional views of the Rwenzori range along the route.',
          'Lunch can be arranged around Fort Portal or one of the crater lake viewpoints before continuing toward Kibale Forest National Park.',
          'Overnight is at Kibale Forest Lodge on full board.',
        ],
        highlights: ['Fort Portal transit', 'Crater lakes', 'Kibale lodge stay'],
        baseLocation: 'Queen Elizabeth National Park',
        overnightLocation: 'Kibale Forest Lodge',
      },
      {
        id: 'day-9-kibale-chimps',
        dayLabel: 'Day 9',
        headline: 'Morning chimpanzee trekking in Kibale Forest National Park',
        details: [
          'After breakfast, prepare for the chimpanzee trekking activity with the forest briefing and ranger-led walk in Kibale.',
          'The chimpanzee search generally takes about 3 to 4 hours depending on movement in the forest that day.',
          'Return to the lodge in time for lunch and a relaxed finish to the safari.',
        ],
        highlights: ['Chimpanzee trekking', 'Rainforest walk', 'Kibale finale'],
        baseLocation: 'Kibale Forest National Park',
        overnightLocation: 'Kibale Forest Lodge',
      },
    ],
    snapshot: {
      startEnd: 'Entebbe or Kampala start with Kibale finish',
      routeStyle:
        'Adventure-focused Uganda circuit combining lake activities, primates, mountain hiking, and savannah wildlife.',
      pace:
        'Active and varied, with multiple early starts, several park transfers, and a mix of trekking, hiking, boating, and game drives.',
      mainFocus:
        'Lake Bunyonyi, mountain gorillas, Mgahinga volcano hiking, Ishasha lions, and Kibale chimpanzees.',
      mainRoute: 'Lake Bunyonyi / Rushaga / Mgahinga / Ishasha / Queen Elizabeth / Fort Portal / Kibale',
      permitPlanning:
        'Gorilla trekking, volcano hiking logistics, and chimpanzee permits should be coordinated in advance because this route includes several high-demand activities.',
    },
    planningNotes: [
      'This is one of the more active routes in the catalog, so it suits travelers comfortable with both long drives and physically demanding activity days.',
      'The source text ends at Kibale rather than returning to Entebbe, so the final onward transfer should be confirmed when pricing the trip.',
      'Day 3 was normalized so the gorilla briefing follows the transfer from Lake Bunyonyi toward Rushaga rather than appearing to start from the lakeside lodge.',
      'Weather and trail conditions can significantly affect both the gorilla trek and the volcano hike, so flexibility in daily pacing is important.',
    ],
    includes: [
      'Road transfers and driver-guide support throughout the route',
      'Accommodation and meals as indicated in the itinerary',
      'Boat cruise and community experience at Lake Bunyonyi',
      'Gorilla trekking coordination in Bwindi',
      'Volcano hiking day in Mgahinga National Park',
      'Game drives in Ishasha and Queen Elizabeth National Park',
      'Chimpanzee trekking coordination in Kibale Forest National Park',
    ],
    excludes: [],
    packages: [],
    bestFor:
      'Travelers who want a broad Uganda adventure that goes beyond gorillas to include volcano hiking, classic savannah wildlife, lake scenery, and chimpanzee trekking.',
    routeStops: [
      'Lake Bunyonyi, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Mgahinga Gorilla National Park, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Kasenyi Plains, Queen Elizabeth National Park, Uganda',
      'Mweya Peninsula, Queen Elizabeth National Park, Uganda',
      'Fort Portal, Uganda',
      'Kibale Forest National Park, Uganda',
    ],
    mapLocation: 'Bwindi Impenetrable National Park, Uganda',
  },
  '6-days-murchison-queen-bwindi': {
    overview:
      'This 5-night Uganda road safari begins with the Nile and Murchison Falls, continues through Queen Elizabeth and Ishasha for classic savannah wildlife, and finishes with gorilla trekking in the Rushaga sector of Bwindi.',
    highlights: ['Murchison Nile boat cruise', 'Tree-climbing lions in Ishasha', 'Rushaga gorilla trekking'],
    itineraryOutline: [
      'Day 1: Murchison Falls National Park and afternoon boat cruise to the bottom of the falls.',
      'Day 2: Morning game drive in Murchison Falls and transfer to Queen Elizabeth National Park.',
      'Day 3: Game drive at Kasenyi or Mweya and tree-climbing lion search in Ishasha sector.',
      'Day 4: Transfer from Ishasha to Bwindi Impenetrable Forest National Park.',
      'Day 5: Ultimate gorilla trekking experience in the Rushaga sector of Bwindi.',
      'Day 6: Transfer back to Kampala or Entebbe with a lunch stop at Igongo Cultural Centre.',
    ],
    itineraryDays: [
      {
        id: 'day-1-murchison-boat',
        dayLabel: 'Day 1',
        headline: 'Transfer to Murchison Falls National Park and boat cruise on the Nile',
        details: [
          'The safari begins around 9:30 a.m. with the road journey north toward Murchison Falls National Park along the Kampala-Gulu highway.',
          'A short refreshment stop is usually made in Luwero for fruit and roadside produce before continuing to the park area.',
          'After lunch, head out for the 2:30 p.m. launch cruise on the River Nile, a relaxed ride of roughly three and a half hours toward the bottom of Murchison Falls.',
          'Wildlife commonly seen along the banks includes hippos, crocodiles, buffaloes, elephants, warthogs, monitor lizards, African fish eagles, bee-eaters, skimmers, cattle egrets, and, with luck, the shoebill before overnight at Red Chilli Rest Camp.',
        ],
        highlights: ['Road transfer', 'Nile boat cruise', 'Murchison wildlife'],
        baseLocation: 'Kampala / Entebbe',
        overnightLocation: 'Red Chilli Rest Camp',
      },
      {
        id: 'day-2-murchison-to-queen',
        dayLabel: 'Day 2',
        headline: 'Morning game drive in Murchison and transfer to Queen Elizabeth National Park',
        details: [
          'After breakfast around 6:00 a.m., set out by about 6:30 a.m. for an early game drive while nocturnal species and predators are still active.',
          'The drive usually explores tracks such as Queen and Albert for sightings of elephants, lions, giraffes, antelopes, jackals, hyenas, Uganda kobs, oribis, buffaloes, waterbucks, Jackson\'s hartebeests, bushbucks, and, with luck, leopards.',
          'After check-out, begin the longer transfer south toward Queen Elizabeth National Park and the Ishasha area.',
          'Reach Ishasha Pride Lodge in the evening for overnight.',
        ],
        highlights: ['Early game drive', 'Northern sector wildlife', 'Transfer south'],
        baseLocation: 'Murchison Falls National Park',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-3-queen-ishasha-circuit',
        dayLabel: 'Day 3',
        headline: 'Game drive through Kasenyi or Mweya and Ishasha tree-climbing lion search',
        details: [
          'Begin the morning with wildlife viewing in Queen Elizabeth National Park, continuing toward Kasenyi or Mweya where lion sightings and broader savannah game viewing are often strongest.',
          'Later, proceed toward the Ishasha sector in search of the famous tree-climbing lions and any prey they may be guarding in the fig trees.',
          'Return later in the afternoon for lunch and time to relax at the lodge balconies before overnight at Ishasha Pride Lodge.',
        ],
        highlights: ['Queen Elizabeth circuit', 'Kasenyi or Mweya', 'Tree-climbing lions'],
        baseLocation: 'Ishasha Sector',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-4-ishasha-to-bwindi',
        dayLabel: 'Day 4',
        headline: 'Transfer to Bwindi Impenetrable Forest National Park',
        details: [
          'After breakfast around 9:00 a.m., depart Ishasha and continue toward Bwindi Impenetrable Forest National Park.',
          'The route is scenic and passes local villages, rolling hills, and highland landscapes as you move deeper into southwestern Uganda.',
          'The drive usually takes about 5 to 6 hours, arriving in the late afternoon in time for dinner at Rushaga Gorilla Lodge.',
        ],
        highlights: ['Scenic transfer', 'Highland views', 'Rushaga arrival'],
        baseLocation: 'Ishasha Pride Lodge',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-5-bwindi-gorillas',
        dayLabel: 'Day 5',
        headline: 'Ultimate gorilla trekking experience in Bwindi',
        details: [
          'After breakfast around 6:30 a.m., drive the short distance, often about five minutes, to the briefing point in the Rushaga sector for the ranger orientation.',
          'The gorilla trek begins after the briefing and can take approximately 4 to 8 hours depending on where the gorilla family is found.',
          'Once located, you spend one hour observing the gorillas before returning from the forest with the ranger team.',
          'Return to Rushaga Gorilla Lodge with the day\'s memories for dinner and overnight.',
        ],
        highlights: ['Ranger briefing', 'Gorilla trekking', 'Rushaga sector'],
        baseLocation: 'Rushaga',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-6-bwindi-to-entebbe',
        dayLabel: 'Day 6',
        headline: 'Transfer back to Kampala or Entebbe',
        details: [
          'After breakfast around 7:00 a.m., begin the long return drive from Bwindi toward Kampala and Entebbe.',
          'The journey generally takes about 7 to 8 hours and includes a lunch stop of roughly one hour at Igongo Cultural Centre before continuing eastward.',
          'Arrival at Entebbe International Airport is typically planned for the evening, often around 8:30 p.m., depending on traffic and stop duration.',
        ],
        highlights: ['Long road transfer', 'Igongo stopover', 'Departure connection'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Kampala or Entebbe return',
      routeStyle:
        'Classic Uganda road safari joining the Nile, savannah wildlife parks, Ishasha, and Bwindi in one loop.',
      pace:
        'Fast-moving and transfer-heavy, with multiple long drives balanced by boat cruising, game drives, and one gorilla trekking day.',
      mainFocus:
        'Murchison Falls boat safari, Queen Elizabeth game viewing, Ishasha lions, and gorilla trekking in Rushaga.',
      mainRoute: 'Kampala / Murchison / Queen Elizabeth / Ishasha / Bwindi / Entebbe',
      permitPlanning:
        'The source inclusion list mentions 4 gorilla permits per person even though the itinerary shows one gorilla trekking day, so the permit count should be reconfirmed before booking.',
    },
    planningNotes: [
      'This is a broad Uganda route compressed into six days, so it works best for travelers comfortable with several long road-transfer days.',
      'The Day 2 transfer from Murchison to Queen Elizabeth is a significant distance, so exact arrival time can vary with traffic, road conditions, and stopovers.',
      'The source package lists 4 gorilla permits per person, but the itinerary contains one gorilla trekking day, so final permit allocation should be clarified in the quotation.',
      'Wildlife sightings in Murchison, Kasenyi, Mweya, and Ishasha depend on seasonal movement and timing, so the guide may adjust search patterns on the day.',
    ],
    includes: [
      'Transfers in customized safari vehicle',
      'Full-board accommodation for 5 nights / 6 days',
      'All activities mentioned in the itinerary',
      '4 gorilla permits per person',
      'Bottled water on safari',
      'Fuel for 6 days',
      'Guide and driver fee for 6 days',
      'Park entrance fee for 3 days in the national parks',
      'Vehicle park entrance fee',
      'Guide park entrance fee',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want one Uganda road safari that combines the Nile, classic savannah wildlife, Ishasha tree-climbing lions, and a Bwindi gorilla trekking finale.',
    routeStops: [
      'Kampala, Uganda',
      'Luwero, Uganda',
      'Murchison Falls National Park, Uganda',
      'River Nile, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kasenyi Plains, Queen Elizabeth National Park, Uganda',
      'Mweya Peninsula, Queen Elizabeth National Park, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Igongo Cultural Centre, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Murchison Falls National Park, Uganda',
  },
  '3-days-queen-ishasha-bunyonyi': {
    overview:
      'This short Uganda safari links Queen Elizabeth National Park, the Ishasha sector for tree-climbing lions, and Lake Bunyonyi for a scenic finish before the return to Entebbe.',
    highlights: ['Queen Elizabeth game drive', 'Ishasha tree-climbing lions', 'Lake Bunyonyi boat cruise'],
    itineraryOutline: [
      'Day 1: Depart Kampala or Entebbe via Fort Portal, enjoy a Queen Elizabeth game drive, and overnight in Ishasha.',
      'Day 2: Morning game drive in Ishasha and transfer to Lake Bunyonyi.',
      'Day 3: Boat cruise on Lake Bunyonyi and return to Entebbe with an Igongo stopover.',
    ],
    itineraryDays: [
      {
        id: 'day-1-queen-elizabeth-ishasha',
        dayLabel: 'Day 1',
        headline: 'Drive from Kampala or Entebbe to Queen Elizabeth National Park and Ishasha',
        details: [
          'Depart in the morning from Kampala or Entebbe and travel west through Fort Portal, passing tea plantations and traditional homesteads along the way.',
          'On arrival in Queen Elizabeth National Park, continue with an afternoon game drive in the Kasenyi sector, which is well known for wildlife sightings including lions and, with luck, leopards.',
          'Later, continue south through the park toward the Ishasha sector before settling in at Ishasha Pride Lodge for dinner and overnight.',
        ],
        highlights: ['Scenic western Uganda drive', 'Kasenyi game drive', 'Ishasha overnight'],
        baseLocation: 'Kampala / Entebbe',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-2-ishasha-bunyonyi',
        dayLabel: 'Day 2',
        headline: 'Morning tree-climbing lion search in Ishasha and transfer to Lake Bunyonyi',
        details: [
          'After breakfast around 7:00 a.m., head out for an early morning game drive in the Ishasha sector in search of the famous tree-climbing lions.',
          'The drive can also reveal birds, leopards, and other mammals that may not have been seen during the Kasenyi session on the previous day.',
          'After check-out, continue to Lake Bunyonyi on a drive of roughly 5 to 6 hours, arriving in the evening for overnight at Bunyonyi Overland Resort.',
        ],
        highlights: ['Ishasha lions', 'Wildlife viewing', 'Lake transfer'],
        baseLocation: 'Ishasha Sector',
        overnightLocation: 'Bunyonyi Overland Resort',
      },
      {
        id: 'day-3-bunyonyi-entebbe',
        dayLabel: 'Day 3',
        headline: 'Boat cruise on Lake Bunyonyi and transfer to Entebbe',
        details: [
          'After a relaxed breakfast, enjoy a boat cruise of about one and a half hours to visit some of Lake Bunyonyi’s notable islands, including Punishment Island and Bwama Island.',
          'Your guide shares the stories and history connected to the islands while you enjoy the lake scenery and birdlife.',
          'After check-out, begin the return drive to Entebbe, with a lunch stop at Igongo Cultural Centre before continuing toward the airport or hotel drop-off.',
        ],
        highlights: ['Lake cruise', 'Island history', 'Entebbe return'],
        baseLocation: 'Lake Bunyonyi',
        overnightLocation: 'Entebbe',
      },
    ],
    snapshot: {
      startEnd: 'Kampala or Entebbe return',
      routeStyle:
        'Short road safari linking savannah wildlife in Queen Elizabeth and Ishasha with a scenic lake extension in southwestern Uganda.',
      pace:
        'Fast-moving itinerary with long road sections balanced by game viewing and one restful lake activity.',
      mainFocus:
        'Kasenyi wildlife, Ishasha tree-climbing lions, and Lake Bunyonyi island scenery.',
      mainRoute: 'Kampala / Fort Portal / Queen Elizabeth / Ishasha / Lake Bunyonyi / Entebbe',
      permitPlanning:
        'No specialist trekking permits are listed here, but park entry timing and the Bunyonyi boat activity should be confirmed in advance.',
    },
    planningNotes: [
      'This itinerary compresses several destinations into a short time, so expect long but scenic driving days.',
      'Wildlife sightings in Kasenyi and Ishasha depend on timing, weather, and animal movement, so the guide may adjust the search pattern on the day.',
      'Lake Bunyonyi offers a softer finish after the safari drives, but the final return to Entebbe is still a substantial road journey.',
      'The source quotation appears to reflect a specific traveler setup, so final pricing should be reconfirmed based on group size and current park rates.',
    ],
    quotation: [
      'Accommodation subtotal quoted in the source itinerary: $1,090.',
      'Fuel, driver-guide, and vehicle subtotal quoted in the source itinerary: $1,350.',
      'Boat cruise activity subtotal quoted in the source itinerary: $100.',
      'Queen Elizabeth National Park entrance subtotal quoted in the source itinerary: $315.',
      'Total safari cost quoted in the source itinerary: $2,855.',
    ],
    includes: [
      'Transfers in customized safari vehicle',
      'Full-board accommodation for 2 nights',
      'All activities mentioned in the itinerary',
      'Bottled water on safari',
      'Fuel for 3 days',
      'Guide and driver fee',
      'Park entrance fee for 1 day in Queen Elizabeth National Park',
      'Vehicle park entrance fee',
      'Guide park entrance fee',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want a short Uganda road safari combining classic savannah wildlife, Ishasha tree-climbing lions, and a scenic Lake Bunyonyi stop.',
    routeStops: [
      'Kampala, Uganda',
      'Fort Portal, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kasenyi Plains, Queen Elizabeth National Park, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Igongo Cultural Centre, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Queen Elizabeth National Park, Uganda',
  },
  '8-days-chimps-wildlife': {
    overview:
      'An 8-day route designed around chimpanzee activity while still delivering strong savannah wildlife experiences.',
    highlights: ['Chimpanzee-centered planning', 'Wildlife and river activities', 'Mid-length safari convenience'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe, briefing, and overnight.',
      'Day 2: Drive to Murchison Falls via Ziwa Rhino Sanctuary.',
      'Day 3: Morning game drive and afternoon Nile boat safari.',
      'Day 4: Top of the falls visit and transfer to Kibale.',
      'Day 5: Chimpanzee trekking and Bigodi wetland walk.',
      'Day 6: Transfer to Queen Elizabeth National Park; evening game drive.',
      'Day 7: Morning game drive and Kazinga Channel boat cruise.',
      'Day 8: Return to Entebbe for departure.',
    ],
    includes: ['Primate and wildlife sequencing', 'Lodge and transport coordination', 'Daily timing and route support'],
    bestFor: 'Travelers who prioritize chimp tracking but still want classic safari variety.',
    routeStops: [
      'Entebbe, Uganda',
      'Ziwa Rhino Sanctuary, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Kibale National Park, Uganda',
  },
  '20-days-uganda': {
    overview:
      'A full-spectrum Uganda itinerary covering major ecosystems with flexibility for photography, birding, and repeat sightings.',
    highlights: ['Extensive national park coverage', 'Flexible specialty activity windows', 'Long-form safari experience'],
    itineraryOutline: [
      'Day 1: Arrive in Entebbe, briefing, and overnight.',
      'Day 2: Kampala and Jinja orientation with cultural and lakeside stops.',
      'Day 3: Travel to Kidepo Valley National Park.',
      'Day 4: Kidepo game drive across open savannah terrain.',
      'Day 5: Cultural visit near Kidepo and an evening game drive.',
      'Day 6: Travel south toward Murchison Falls with rest stops.',
      'Day 7: Murchison Falls game drive and wildlife tracking.',
      'Day 8: Nile boat safari and top of the falls viewpoint.',
      'Day 9: Transfer to Kibale and Fort Portal region.',
      'Day 10: Chimpanzee trekking in Kibale National Park.',
      'Day 11: Bigodi wetland walk and crater lakes visit.',
      'Day 12: Transfer to Queen Elizabeth National Park; evening game drive.',
      'Day 13: Morning game drive and Kazinga Channel boat cruise.',
      'Day 14: Ishasha sector game drive for tree-climbing lions.',
      'Day 15: Transfer to Bwindi with scenic highland views.',
      'Day 16: Gorilla trekking and relaxed lodge evening.',
      'Day 17: Lake Bunyonyi canoe ride and lakeside downtime.',
      'Day 18: Transfer to Lake Mburo National Park.',
      'Day 19: Walking safari and afternoon game drive in Lake Mburo.',
      'Day 20: Return to Entebbe for departure.',
    ],
    includes: ['Comprehensive route design', 'Multi-week logistics oversight', 'Adaptive day-to-day coordination'],
    bestFor: 'Long-stay travelers and content creators needing broad destination coverage.',
    routeStops: [
      'Entebbe, Uganda',
      'Kampala, Uganda',
      'Jinja, Uganda',
      'Kidepo Valley National Park, Uganda',
      'Murchison Falls National Park, Uganda',
      'Kibale National Park, Uganda',
      'Fort Portal, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Queen Elizabeth National Park, Uganda',
      'Kazinga Channel, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'Bwindi Impenetrable National Park, Uganda',
      'Lake Bunyonyi, Uganda',
      'Lake Mburo National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Kidepo Valley National Park, Uganda',
  },
  '3-days-gorilla-habituation': {
    overview:
      'A focused 3-day itinerary built around the longer gorilla habituation experience with efficient travel planning.',
    highlights: ['Gorilla habituation priority', 'Compact and efficient routing', 'High-value short safari'],
    itineraryOutline: [
      'Day 1: Drive from Entebbe to the Rushaga sector of Bwindi for briefing.',
      'Day 2: Full-day gorilla habituation experience in Rushaga and evening at the lodge.',
      'Day 3: Return to Entebbe for onward travel.',
    ],
    includes: ['Habituation-day schedule planning', 'Transfer and lodge coordination', 'Pre-trip briefing support'],
    bestFor: 'Travelers specifically targeting gorilla habituation in a short window.',
    routeStops: [
      'Entebbe, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
  },
  '3-days-chimp-habituation': {
    overview:
      'A short, chimp-focused itinerary designed for deeper primate time through habituation-style forest engagement.',
    highlights: ['Chimpanzee habituation focus', 'Forest-based immersive activity', 'Three-day rapid itinerary'],
    itineraryOutline: [
      'Day 1: Drive from Entebbe to Kibale and settle into the forest region.',
      'Day 2: Full-day chimpanzee habituation experience and optional Bigodi walk.',
      'Day 3: Return to Entebbe for departure.',
    ],
    includes: ['Chimp activity coordination', 'Short-stay lodging and transport planning', 'On-ground operational support'],
    bestFor: 'Travelers who want an immersive chimp experience in minimal time.',
    routeStops: [
      'Entebbe, Uganda',
      'Kibale National Park, Uganda',
      'Bigodi Wetland Sanctuary, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Kibale National Park, Uganda',
  },
  '5-days-ishasha-bwindi-gorilla': {
    overview:
      'This 4-night Uganda safari links two of southwestern Uganda’s signature wildlife experiences, beginning with gorilla trekking in the Rushaga sector of Bwindi and continuing to Ishasha for tree-climbing lions before the return to Kampala or Entebbe.',
    highlights: ['Bwindi gorilla trekking', 'Ishasha tree-climbing lions', 'Scenic southwestern road safari'],
    itineraryOutline: [
      'Day 1: Drive from Entebbe or Kampala to Bwindi with an Equator stop and overnight in Rushaga.',
      'Day 2: Gorilla trekking in Bwindi Impenetrable National Park.',
      'Day 3: Scenic transfer from Rushaga to Ishasha sector in Queen Elizabeth National Park.',
      'Day 4: Morning game drive in Ishasha and relaxed lodge afternoon.',
      'Day 5: Return drive to Kampala or Entebbe for onward travel.',
    ],
    itineraryDays: [
      {
        id: 'day-1-entebbe-to-bwindi',
        dayLabel: 'Day 1',
        headline: 'Safari journey to Bwindi Impenetrable National Park',
        details: [
          'After pickup and safari briefing, depart from Entebbe or Kampala and begin the long road journey toward Bwindi Impenetrable National Park.',
          'The route passes small towns and roadside markets, with a stop at the Uganda Equator and a lunch break before continuing into southwestern Uganda.',
          'The drive usually takes about 9 to 10 hours, arriving in the late afternoon or evening for dinner and overnight at Rushaga Gorilla Lodge on full board.',
        ],
        highlights: ['Road safari start', 'Equator stop', 'Rushaga arrival'],
        baseLocation: 'Entebbe / Kampala',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-2-bwindi-gorilla-trekking',
        dayLabel: 'Day 2',
        headline: 'Gorilla trekking in Bwindi Impenetrable National Park',
        details: [
          'After breakfast and with packed lunch, drive about 5 to 7 minutes to the park briefing point for the gorilla trekking orientation.',
          'Gorilla family allocation is generally guided by fitness, interests, and age, and the guide can help communicate your preferred trekking style before you enter the forest.',
          'The trek can take from under an hour to 6 to 8 hours depending on where the family is located, with forest interpretation along the way until the gorillas are found.',
          'Once the gorillas are found, you spend one hour observing and photographing them before trekking back to the starting point to receive your certificate.',
          'Dinner and overnight are again at Rushaga Gorilla Lodge.',
        ],
        highlights: ['Park briefing', 'Mountain gorillas', 'Trekking certificate'],
        baseLocation: 'Rushaga Sector, Bwindi',
        overnightLocation: 'Rushaga Gorilla Lodge',
      },
      {
        id: 'day-3-bwindi-to-ishasha',
        dayLabel: 'Day 3',
        headline: 'Scenic drive to Ishasha sector in Queen Elizabeth National Park',
        details: [
          'After breakfast, leave the Rushaga sector and continue north on a scenic transfer toward the Ishasha sector of Queen Elizabeth National Park.',
          'Arrive in time for lunch at the lodge, check in, and relax before the late afternoon game drive.',
          'The first Ishasha session focuses on tree-climbing lions together with other wildlife found across the southern sector of the park before overnight at Ishasha Pride Lodge.',
        ],
        highlights: ['Scenic transfer', 'Ishasha game drive', 'Tree-climbing lions'],
        baseLocation: 'Rushaga Gorilla Lodge',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-4-ishasha-morning-drive',
        dayLabel: 'Day 4',
        headline: 'Morning game drive in Ishasha and visit toward River Ishasha',
        details: [
          'After breakfast, head back into the Ishasha sector for a morning game drive, the best-known area in Uganda for sightings of tree-climbing lions.',
          'The drive may also reveal buffaloes, elephants, antelope, and other savannah wildlife before continuing toward River Ishasha near the border between Uganda and the Democratic Republic of the Congo.',
          'Return to the lodge for a late lunch and a quieter afternoon enjoying the birds, bush sounds, and lodge setting before dinner and overnight at Ishasha Pride Lodge.',
        ],
        highlights: ['Morning safari', 'River Ishasha area', 'Lodge downtime'],
        baseLocation: 'Ishasha Sector',
        overnightLocation: 'Ishasha Pride Lodge',
      },
      {
        id: 'day-5-ishasha-to-entebbe',
        dayLabel: 'Day 5',
        headline: 'Drive back to Kampala or Entebbe International Airport',
        details: [
          'After breakfast, check out and begin the final road transfer back toward Kampala or Entebbe.',
          'Having completed the Bwindi and Ishasha sections of the safari, the final day is mainly a travel day planned around your flight schedule or hotel drop-off.',
          'The safari ends on arrival in Kampala or at Entebbe International Airport for onward travel.',
        ],
        highlights: ['Return transfer', 'Airport connection', 'Safari finale'],
        baseLocation: 'Ishasha Pride Lodge',
        overnightLocation: 'Entebbe / Kampala',
      },
    ],
    snapshot: {
      startEnd: 'Entebbe or Kampala return',
      routeStyle:
        'Road safari focused on two signature southwestern Uganda experiences: gorilla trekking in Bwindi and tree-climbing lions in Ishasha.',
      pace:
        'Compact but manageable, with two long road-transfer days balanced by one gorilla trek and dedicated wildlife time in Ishasha.',
      mainFocus:
        'Bwindi gorilla trekking, Ishasha tree-climbing lions, and scenic southwestern Uganda road travel.',
      mainRoute: 'Entebbe / Equator / Bwindi Rushaga / Ishasha / Entebbe',
      permitPlanning:
        'The gorilla permit should be secured early, while park entry and game-drive timing in Ishasha can then be aligned around the confirmed trek date.',
    },
    planningNotes: [
      'Day 1 is a long transfer into Bwindi, so the package suits travelers comfortable with a full road day at the start of the safari.',
      'Gorilla trekking duration can vary widely depending on the assigned family and forest conditions, so the second day should stay flexible.',
      'The source wording references single-room accommodation at both lodges, so final pricing should be reconfirmed if the travel party or room setup differs.',
      'Ishasha wildlife sightings, especially tree-climbing lions, depend on timing and animal movement, so the guide may adapt the drive route on the day.',
    ],
    includes: [
      'Transfers in customized safari vehicle',
      'Full-board accommodation for 4 nights / 5 days',
      'All activities mentioned in the itinerary',
      '1 gorilla permit per person',
      'Bottled water on safari',
      'Fuel for 5 days',
      'Guide, driver, and vehicle for 5 days',
    ],
    excludes: [
      'Personal international flights',
      'Visa fees, including Uganda visa or East African tourist visa charges',
      'Meals and drinks not mentioned in the itinerary',
      'Items of a personal nature',
      'Laundry service',
      'Tips and gratuities',
    ],
    packages: [],
    bestFor:
      'Travelers who want a short Uganda safari built around Bwindi gorilla trekking first and Ishasha tree-climbing lions second, without adding extra park stops.',
    routeStops: [
      'Entebbe, Uganda',
      'Uganda Equator, Uganda',
      'Rushaga Sector, Bwindi Impenetrable National Park, Uganda',
      'Ishasha Sector, Queen Elizabeth National Park, Uganda',
      'River Ishasha, Uganda',
      'Kampala, Uganda',
      'Entebbe, Uganda',
    ],
    mapLocation: 'Bwindi Impenetrable National Park, Uganda',
  },
}

const buildTourDetail = (tour: Tour, detail: TourDetailContent): TourDetail => {
  const routeStops =
    detail.routeStops && detail.routeStops.length > 0 ? detail.routeStops : [detail.mapLocation]
  const packages = Object.prototype.hasOwnProperty.call(detail, 'packages')
    ? detail.packages ?? []
    : defaultPackages

  return {
    ...detail,
    packages,
    routeStops,
    itineraryDays:
      detail.itineraryDays && detail.itineraryDays.length > 0
        ? detail.itineraryDays
        : buildGeneratedItineraryDays(detail.itineraryOutline, routeStops),
    snapshot:
      detail.snapshot ?? buildGeneratedSnapshot(tour, detail, routeStops),
    planningNotes:
      detail.planningNotes && detail.planningNotes.length > 0
        ? detail.planningNotes
        : buildGeneratedPlanningNotes(tour, detail, routeStops),
    quotation: detail.quotation ?? [],
    excludes: detail.excludes ?? [],
    mapEmbedUrl: buildMapEmbedUrl(detail.mapLocation),
  }
}

export function getTourDetail(tour: Tour): TourDetail {
  const fallbackLocation = tour.country?.trim() || 'Uganda'

  const detail = tourDetailContent[tour.id]

  if (detail) {
    return buildTourDetail(tour, detail)
  }

  return buildTourDetail(tour, {
    overview: `${tour.summary} This itinerary can be tailored based on your dates, budget, and preferred activity pace.`,
    highlights: ['Flexible itinerary design', 'Local logistics support', 'Customizable activity pacing'],
    itineraryOutline: [
      'Arrival and route briefing with transport setup.',
      'Core activities delivered according to your selected focus.',
      'Return transfer with optional stopover planning.',
    ],
    includes: ['Trip planning and scheduling support', 'Ground coordination throughout the route', 'Pre-departure and on-trip assistance'],
    quotation: [],
    excludes: [],
    bestFor: 'Travelers looking for a tailored safari format with dependable coordination.',
    routeStops: [fallbackLocation],
    mapLocation: fallbackLocation,
  })
}
