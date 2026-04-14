const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase()

export const dedupeKeywords = (keywords: readonly string[]) => {
  const seen = new Set<string>()
  const output: string[] = []

  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeKeyword(keyword)

    if (normalizedKeyword.length === 0 || seen.has(normalizedKeyword)) {
      return
    }

    seen.add(normalizedKeyword)
    output.push(keyword.trim())
  })

  return output
}

const sanitizeKeywordSeed = (value: string) =>
  value.replace(/[^\w\s&/().,+-]/g, ' ').replace(/\s+/g, ' ').trim()

type KeywordEntityType = 'tour' | 'destination' | 'service'

const ENTITY_KEYWORD_TEMPLATES: Record<KeywordEntityType, readonly string[]> = {
  tour: [
    '{name}',
    '{name} Uganda',
    '{name} safari',
    '{name} safari tour',
    '{name} travel package',
    'Uganda safari {name}',
  ],
  destination: [
    '{name}',
    '{name} Uganda',
    '{name} safari destination',
    '{name} wildlife tour',
    'Uganda safari {name}',
    'visit {name} Uganda',
  ],
  service: [
    '{name}',
    '{name} Uganda',
    '{name} Uganda safari',
    'Uganda safari {name}',
    '{name} travel service',
    '{name} safari support',
  ],
}

export const UGANDA_SAFARI_KEYWORDS = dedupeKeywords([
  'Uganda safari',
  'Uganda safari tours',
  'Uganda safari packages',
  'Uganda safari holidays',
  'Uganda safari trips',
  'Uganda safari deals',
  'Uganda safari travel',
  'Uganda safari experience',
  'Uganda safari adventure',
  'Uganda safari guide',
  'Uganda safari company',
  'Uganda safari operators',
  'Uganda safari booking',
  'Uganda safari itinerary',
  'Uganda safari cost',
  'Uganda safari price',
  'Uganda safari vacation',
  'Uganda safari holiday packages',
  'Uganda safari adventure tours',
  'Uganda safari travel packages',
  'Uganda safari tour companies',
  'Uganda safari travel deals',
  'Uganda safari booking online',
  'Uganda safari holiday deals',
  'Uganda safari holiday trips',
  'Uganda safari travel agency',
  'Uganda safari operators Africa',
  'Uganda safari private tours',
  'Uganda safari group tours',
  'Uganda safari custom tours',
  'Uganda safari planning',
  'Uganda safari ideas',
  'Uganda safari destinations',
  'Uganda safari adventures Africa',
  'Uganda safari wildlife adventure',
  'Uganda safari vacation deals',
  'Uganda safari holiday planning',
  'Uganda safari tours Africa',
  'Uganda safari nature tours',
  'Uganda safari wildlife tours',
  'Uganda safari travel experiences',
  'Uganda safari holiday travel',
  'Uganda safari wildlife adventure tours',
  'Uganda safari luxury packages',
  'Uganda safari budget packages',
  'Uganda safari family tours',
  'Uganda safari honeymoon tours',
  'Uganda safari adventure holidays',
  'Uganda safari guided tours',
  'Uganda safari tours and travel',
  'best Uganda safari',
  'affordable Uganda safari',
  'luxury Uganda safari',
  'cheap Uganda safari',
  'budget Uganda safari',
  'private Uganda safari',
  'group Uganda safari',
  'custom Uganda safari',
  'guided Uganda safari',
  'small group Uganda safari',
  'Uganda safari specialists',
  'Uganda safari experts',
  'Uganda safari holidays Africa',
  'Uganda safari vacation Africa',
  'Uganda safari wildlife trips',
  'Uganda safari travel Africa',
  'Uganda safari adventure travel',
  'Uganda safari wildlife holidays',
  'Uganda safari wildlife experience',
  'Uganda safari tour packages',
  'Uganda safari adventure packages',
  'Uganda safari holiday trips Africa',
  'Uganda safari deals Africa',
  'Uganda safari booking deals',
  'Uganda safari online booking',
  'Uganda safari holiday booking',
  'Uganda safari itinerary planner',
  'Uganda safari travel guide',
  'Uganda safari wildlife guide',
  'Uganda safari adventure guide',
  'Uganda safari trips Africa',
  'Uganda safari travel planner',
  'Uganda safari vacation planner',
  'Uganda safari holiday planner',
  'Uganda safari packages Africa',
  'Uganda safari wildlife packages',
  'Uganda safari travel holidays',
  'Uganda safari adventure holidays Africa',
  'Uganda safari wildlife trips Africa',
  'Uganda safari travel experts',
  'Uganda safari tour deals',
  'Uganda safari booking packages',
  'Uganda safari travel tours',
  'Uganda safari wildlife holidays Africa',
  'Uganda safari nature holidays',
  'Uganda safari travel experiences Africa',
  'Uganda safari travel offers',
  'Uganda safari holiday offers',
  'Uganda safari vacation offers',
  'Uganda safari adventure offers',
  'Uganda wildlife safari',
  'Uganda wildlife safari tours',
  'Uganda wildlife safari packages',
  'Uganda wildlife holidays',
  'Uganda wildlife tours and travel',
  'Uganda nature and wildlife safari',
  'Uganda safari and gorilla trekking',
  'Uganda safari with gorilla trekking',
  'Uganda primate safari',
  'Uganda big five safari',
  'Uganda custom travel itineraries',
  'Uganda holiday travel packages',
  'Uganda safari operator Kampala',
  'East Africa Uganda safari packages',
  'Uganda park safari tours',
  'Uganda national park safari holidays',
  'Uganda wildlife and adventure travel',
])

export const GORILLA_TREKKING_KEYWORDS = dedupeKeywords([
  'gorilla trekking Uganda',
  'gorilla trekking safari',
  'gorilla trekking tours',
  'gorilla trekking packages',
  'gorilla trekking trips',
  'gorilla trekking holidays',
  'gorilla trekking Africa',
  'gorilla trekking experience',
  'gorilla trekking adventure',
  'gorilla trekking travel',
  'mountain gorilla trekking',
  'gorilla trekking Bwindi',
  'gorilla trekking tours Uganda',
  'gorilla trekking safari Uganda',
  'gorilla trekking cost Uganda',
  'gorilla trekking permit Uganda',
  'gorilla trekking booking',
  'gorilla trekking packages Uganda',
  'gorilla trekking holidays Uganda',
  'gorilla trekking trips Uganda',
  'gorilla trekking Africa tours',
  'gorilla trekking Africa safari',
  'gorilla trekking adventure tours',
  'gorilla trekking wildlife tours',
  'gorilla trekking travel packages',
  'gorilla trekking travel deals',
  'gorilla trekking safari packages',
  'gorilla trekking wildlife adventure',
  'gorilla trekking holiday packages',
  'gorilla trekking travel experience',
  'gorilla trekking tours Africa',
  'gorilla trekking wildlife safari',
  'gorilla trekking safari holidays',
  'gorilla trekking safari deals',
  'gorilla trekking wildlife experience',
  'gorilla trekking nature tours',
  'gorilla trekking eco tours',
  'gorilla trekking travel Africa',
  'gorilla trekking wildlife holidays',
  'gorilla trekking wildlife tours Africa',
  'gorilla trekking holiday tours',
  'gorilla trekking travel holidays',
  'gorilla trekking vacation packages',
  'gorilla trekking travel guides',
  'gorilla trekking tour companies',
  'gorilla trekking travel operators',
  'gorilla trekking safari operators',
  'gorilla trekking wildlife operators',
  'gorilla trekking adventure holidays',
  'gorilla trekking safari trips',
  'Bwindi gorilla trekking tours',
  'Bwindi gorilla trekking packages',
  'Bwindi gorilla trekking holidays',
  'Bwindi gorilla permit booking',
  'Uganda gorilla permit cost',
  'Uganda gorilla permit booking',
  'luxury gorilla trekking Uganda',
  'budget gorilla trekking Uganda',
  'affordable gorilla trekking Uganda',
  'private gorilla trekking Uganda',
  'group gorilla trekking Uganda',
  'small group gorilla trekking tours',
  'gorilla trekking and wildlife safari Uganda',
  'gorilla trekking and chimpanzee tracking Uganda',
  'gorilla trekking itinerary Uganda',
  'gorilla trekking travel planner Uganda',
  'best gorilla trekking tours in Uganda',
  'Uganda gorilla trekking holiday packages',
  'mountain gorilla safari Uganda',
  'mountain gorilla tours Uganda',
  'gorilla trekking experts Uganda',
  'gorilla trekking specialists Uganda',
  'gorilla trekking guide Uganda',
  'gorilla trekking nature holidays Africa',
  'gorilla trekking wildlife travel Africa',
  'gorilla trekking vacation Africa',
  'gorilla trekking offer Uganda',
  'gorilla trekking booking online Uganda',
])

export function buildKeywordCluster(
  primaryKeywords: readonly string[],
  secondaryKeywords: readonly string[] = [],
  limit = 60,
) {
  return dedupeKeywords([...primaryKeywords, ...secondaryKeywords]).slice(0, limit)
}

export function buildEntityKeywordCluster(
  entityType: KeywordEntityType,
  entityNames: readonly string[],
  limit = 30,
) {
  const templates = ENTITY_KEYWORD_TEMPLATES[entityType] ?? []
  const generatedKeywords = entityNames
    .map((entityName) => sanitizeKeywordSeed(entityName))
    .filter((entityName) => entityName.length > 0)
    .flatMap((entityName) =>
      templates.map((template) => template.replaceAll('{name}', entityName)),
    )

  return dedupeKeywords(generatedKeywords).slice(0, limit)
}

export function buildPageKeywordCluster(
  coreKeywords: readonly string[],
  supportingKeywords: readonly string[] = [],
  pageEntityKeywords: readonly string[] = [],
  limit = 90,
) {
  return dedupeKeywords([...pageEntityKeywords, ...coreKeywords, ...supportingKeywords]).slice(
    0,
    limit,
  )
}
