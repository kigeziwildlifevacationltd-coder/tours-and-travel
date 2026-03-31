import type { Tour } from '../types/content'

export type TourDetail = {
  overview: string
  highlights: string[]
  itineraryOutline: string[]
  includes: string[]
  packages: string[]
  bestFor: string
  routeStops: string[]
  mapLocation: string
  mapEmbedUrl: string
}

const buildMapEmbedUrl = (location: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`

const defaultPackages = [
  'Budget package: value-focused lodges, shared safari vehicle, and standard meals.',
  'Mid-range package: handpicked lodges, private vehicle, and full-board meals.',
  'Luxury package: premium lodges, private guide, and curated safari experiences.',
]

type TourDetailContent = Omit<TourDetail, 'mapEmbedUrl' | 'packages'> & {
  routeStops?: string[]
  packages?: string[]
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
}

const buildTourDetail = (detail: TourDetailContent): TourDetail => ({
  ...detail,
  packages: detail.packages && detail.packages.length > 0 ? detail.packages : defaultPackages,
  routeStops:
    detail.routeStops && detail.routeStops.length > 0
      ? detail.routeStops
      : [detail.mapLocation],
  mapEmbedUrl: buildMapEmbedUrl(detail.mapLocation),
})

export function getTourDetail(tour: Tour): TourDetail {
  const fallbackLocation = tour.country?.trim() || 'Uganda'

  const detail = tourDetailContent[tour.id]

  if (detail) {
    return buildTourDetail(detail)
  }

  return buildTourDetail({
    overview: `${tour.summary} This itinerary can be tailored based on your dates, budget, and preferred activity pace.`,
    highlights: ['Flexible itinerary design', 'Local logistics support', 'Customizable activity pacing'],
    itineraryOutline: [
      'Arrival and route briefing with transport setup.',
      'Core activities delivered according to your selected focus.',
      'Return transfer with optional stopover planning.',
    ],
    includes: ['Trip planning and scheduling support', 'Ground coordination throughout the route', 'Pre-departure and on-trip assistance'],
    bestFor: 'Travelers looking for a tailored safari format with dependable coordination.',
    routeStops: [fallbackLocation],
    mapLocation: fallbackLocation,
  })
}
