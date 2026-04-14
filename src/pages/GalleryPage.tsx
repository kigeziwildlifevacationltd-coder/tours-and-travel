import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { useTranslation } from '../context/useTranslation'
import { heroBackgroundImages } from '../data/heroImages'
import { useRuntimeTranslatedList } from '../hooks/useRuntimeTranslation'
import type { TranslationKey } from '../i18n/translations'
import {
  GORILLA_TREKKING_KEYWORDS,
  UGANDA_SAFARI_KEYWORDS,
  buildEntityKeywordCluster,
  buildPageKeywordCluster,
} from '../seo/keywordClusters'
import { usePageSeo } from '../seo/usePageSeo'

type GalleryTagKey =
  | 'gallery.tag.primates'
  | 'gallery.tag.bigCats'
  | 'gallery.tag.birdlife'
  | 'gallery.tag.landscapes'
  | 'gallery.tag.safariLife'
  | 'gallery.tag.culture'

type GalleryItem = {
  id: string
  image: string
  tagKey: GalleryTagKey
  titleKey?: TranslationKey
  descriptionKey?: TranslationKey
  altKey?: TranslationKey
  title?: string
  description?: string
  alt?: string
}

const featuredGalleryItems: GalleryItem[] = [
  {
    id: 'gorillas',
    image: '/images/gorilla-family-in-forest-0075.jpg',
    tagKey: 'gallery.tag.primates',
    titleKey: 'gallery.item1Title',
    descriptionKey: 'gallery.item1Description',
    altKey: 'gallery.item1Alt',
  },
  {
    id: 'chimpanzees',
    image: '/images/chimpanzee-family-sitting-0041.jpg',
    tagKey: 'gallery.tag.primates',
    titleKey: 'gallery.item2Title',
    descriptionKey: 'gallery.item2Description',
    altKey: 'gallery.item2Alt',
  },
  {
    id: 'lions',
    image: '/images/tree-climbing-lionesses-resting-0063.jpg',
    tagKey: 'gallery.tag.bigCats',
    titleKey: 'gallery.item3Title',
    descriptionKey: 'gallery.item3Description',
    altKey: 'gallery.item3Alt',
  },
  {
    id: 'shoebill',
    image: '/images/shoebill-standing-in-wetland-0085.jpg',
    tagKey: 'gallery.tag.birdlife',
    titleKey: 'gallery.item4Title',
    descriptionKey: 'gallery.item4Description',
    altKey: 'gallery.item4Alt',
  },
  {
    id: 'game-drive',
    image: '/images/safari-vehicle-in-grassland-0093.jpg',
    tagKey: 'gallery.tag.safariLife',
    titleKey: 'gallery.item5Title',
    descriptionKey: 'gallery.item5Description',
    altKey: 'gallery.item5Alt',
  },
  {
    id: 'waterfall',
    image: '/images/waterfall-rapids-landscape-0043.jpg',
    tagKey: 'gallery.tag.landscapes',
    titleKey: 'gallery.item6Title',
    descriptionKey: 'gallery.item6Description',
    altKey: 'gallery.item6Alt',
  },
  {
    id: 'highland-lake',
    image: '/images/lake-island-mountain-view-0015.jpg',
    tagKey: 'gallery.tag.landscapes',
    titleKey: 'gallery.item7Title',
    descriptionKey: 'gallery.item7Description',
    altKey: 'gallery.item7Alt',
  },
  {
    id: 'couple-retreat',
    image: '/images/couple-at-lake-viewpoint-0037.jpg',
    tagKey: 'gallery.tag.culture',
    titleKey: 'gallery.item8Title',
    descriptionKey: 'gallery.item8Description',
    altKey: 'gallery.item8Alt',
  },
  {
    id: 'lodge',
    image: '/images/breakfast-on-lodge-deck-0042.jpg',
    tagKey: 'gallery.tag.safariLife',
    titleKey: 'gallery.item9Title',
    descriptionKey: 'gallery.item9Description',
    altKey: 'gallery.item9Alt',
  },
]

const extraGalleryImagePaths = [
  '/images/african-buffalo-portrait-0036.jpg',
  '/images/antelope-herd-on-plains-0071.jpg',
  '/images/baby-gorilla-hanging-on-branch-0005.jpg',
  '/images/bright-green-bird-on-branch-0050.jpg',
  '/images/buffalo-charging-forward-0062.jpg',
  '/images/buffalo-herd-at-water-edge-0033.jpg',
  '/images/buffalo-herd-facing-lionesses-0052.jpg',
  '/images/buffalo-herd-on-savannah-0020.jpg',
  '/images/buffalo-ramming-lion-0070.jpg',
  '/images/cheetah-and-cubs-resting-0024.jpg',
  '/images/cheetah-crouching-on-mound-0010.jpg',
  '/images/cheetah-mother-with-cubs-0011.jpg',
  '/images/cheetah-portrait-in-foliage-0015.jpg',
  '/images/cheetah-siblings-on-watch-0010.jpg',
  '/images/cheetah-sprinting-across-grassland-0035.jpg',
  '/images/cheetah-standing-in-grass-0022.jpg',
  '/images/cheetah-standing-white-background-0018.jpg',
  '/images/cheetah-walking-toward-camera-0038.jpg',
  '/images/cheetah-with-cub-in-grass-0023.jpg',
  '/images/chimpanzee-eating-fruit-0009.jpg',
  '/images/chimpanzee-hands-on-head-0042.jpg',
  '/images/chimpanzee-portrait-in-greenery-0057.jpg',
  '/images/chimpanzees-walking-together-0074.jpg',
  '/images/chimpanzees-with-baby-in-tree-0021.jpg',
  '/images/cliffside-bush-breakfast-setup-0083.jpg',
  '/images/cloudy-lakes-viewpoint-0020.jpg',
  '/images/couple-portrait-with-floral-crowns-0002.jpg',
  '/images/couple-portrait-with-floral-hats-0030.jpg',
  '/images/cranes-flying-over-savannah-0072.jpg',
  '/images/crater-lake-aerial-view-0045.jpg',
  '/images/crowned-cranes-dancing-0069.jpg',
  '/images/elephant-herd-by-riverbank-0067.jpg',
  '/images/elephant-in-open-grassland-0064.jpg',
  '/images/elephants-crossing-road-0090.jpg',
  '/images/flock-of-crowned-cranes-0080.jpg',
  '/images/forest-lodge-hillside-view-0059.jpg',
  '/images/friends-at-lodge-lounge-0065.jpg',
  '/images/giraffe-herd-on-road-0032.jpg',
  '/images/giraffes-in-open-field-0084.jpg',
  '/images/giraffes-standing-on-dirt-road-0078.jpg',
  '/images/giraffe-with-buffaloes-0084.jpg',
  '/images/gorilla-carrying-infant-0076.jpg',
  '/images/gorilla-closeup-in-jungle-0044.jpg',
  '/images/gorilla-eating-green-leaves-0086.jpg',
  '/images/gorilla-eating-stem-0091.jpg',
  '/images/gorilla-family-among-leaves-0083.jpg',
  '/images/gorilla-in-dense-foliage-0094.jpg',
  '/images/gorilla-in-rainforest-0081.jpg',
  '/images/gorilla-mother-and-baby-0065.jpg',
  '/images/gorilla-mother-and-infant-0092.jpg',
  '/images/gorilla-mother-and-young-0054.jpg',
  '/images/gorilla-mother-with-infant-0016.jpg',
  '/images/gorilla-pair-in-foliage-0068.jpg',
  '/images/gorilla-peeking-through-leaves-0085.jpg',
  '/images/gorilla-portrait-closeup-0080.jpg',
  '/images/gorilla-sitting-in-forest-0066.jpg',
  '/images/gorillas-on-forest-slope-0073.jpg',
  '/images/gorilla-thinking-portrait-0089.jpg',
  '/images/gorilla-with-infant-on-back-0058.jpg',
  '/images/grey-crowned-crane-portrait-0068.jpg',
  '/images/grey-crowned-crane-standing-0041.jpg',
  '/images/group-at-waterfall-base-0089.jpg',
  '/images/group-seated-at-forest-viewpoint-0058.jpg',
  '/images/group-watching-sunset-0023.jpg',
  '/images/hillside-lodge-aerial-view-0008.jpg',
  '/images/hippopotamus-closeup-portrait-0022.jpg',
  '/images/kingfisher-on-branch-0029.jpg',
  '/images/kudu-antelope-portrait-0055.jpg',
  '/images/lake-and-road-aerial-view-0040.jpg',
  '/images/lake-islands-aerial-landscape-0004.jpg',
  '/images/lake-islands-drone-shot-0019.jpg',
  '/images/lake-islands-overlook-0031.jpg',
  '/images/lakeside-lodge-aerial-0035.jpg',
  '/images/lakeside-resort-aerial-view-0003.jpg',
  '/images/lakeside-resort-drone-view-0049.jpg',
  '/images/leopard-catching-antelope-0049.jpg',
  '/images/leopard-closeup-side-profile-0026.jpg',
  '/images/leopard-cub-on-tree-0027.jpg',
  '/images/leopard-drinking-with-reflection-0054.jpg',
  '/images/leopard-feeding-on-antelope-0053.jpg',
  '/images/leopard-in-tree-with-prey-0016.jpg',
  '/images/leopard-lying-on-tree-branch-0031.jpg',
  '/images/leopard-on-tree-branch-0034.jpg',
  '/images/leopard-peeking-through-grass-0017.jpg',
  '/images/leopard-resting-portrait-0030.jpg',
  '/images/leopard-walking-in-savannah-0062.jpg',
  '/images/leopard-walking-on-sandy-ground-0008.jpg',
  '/images/lion-cub-walking-on-track-0039.jpg',
  '/images/lion-drinking-from-waterhole-0029.jpg',
  '/images/lioness-carrying-zebra-foal-0088.jpg',
  '/images/lioness-chasing-buffalo-0046.jpg',
  '/images/lioness-chasing-running-buffalo-0047.jpg',
  '/images/lioness-climbing-tree-0093.jpg',
  '/images/lioness-clinging-to-buffalo-0048.jpg',
  '/images/lionesses-bringing-down-buffalo-0051.jpg',
  '/images/lionesses-chasing-buffalo-0073.jpg',
  '/images/lionesses-chasing-buffalo-in-dust-0050.jpg',
  '/images/lionesses-hunting-buffalo-0014.jpg',
  '/images/lionesses-on-tree-branch-0079.jpg',
  '/images/lioness-face-closeup-0033.jpg',
] as const

const getImageReferenceName = (imagePath: string) => {
  const pathParts = imagePath.split('/')
  const fileName = pathParts[pathParts.length - 1] ?? imagePath
  return fileName.replace(/\.[^.]+$/, '')
}

const hasToken = (tokens: string[], keywords: readonly string[]) =>
  keywords.some((keyword) => tokens.includes(keyword))

const getImageTokens = (imagePath: string) =>
  getImageReferenceName(imagePath)
    .split('-')
    .filter((token) => token.length > 0 && !/^\d+$/.test(token))
    .map((token) => token.toLowerCase())

const toReadableTitle = (imagePath: string) => {
  const parts = getImageReferenceName(imagePath).split('-').filter(Boolean)
  const withoutTrailingNumber = parts.filter(
    (part, index) => !(index === parts.length - 1 && /^\d+$/.test(part)),
  )

  return withoutTrailingNumber
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

const getTagKeyFromTokens = (tokens: string[]): GalleryTagKey => {
  if (hasToken(tokens, ['gorilla', 'chimpanzee', 'chimpanzees', 'monkey', 'monkeys', 'silverback'])) {
    return 'gallery.tag.primates'
  }

  if (hasToken(tokens, ['lion', 'lioness', 'lionesses', 'leopard', 'cheetah'])) {
    return 'gallery.tag.bigCats'
  }

  if (hasToken(tokens, ['shoebill', 'bird', 'birds', 'crane', 'cranes', 'kingfisher'])) {
    return 'gallery.tag.birdlife'
  }

  if (hasToken(tokens, ['couple', 'friends', 'tourist', 'tourists', 'visitors', 'group', 'cattle', 'tea', 'picker'])) {
    return 'gallery.tag.culture'
  }

  if (hasToken(tokens, ['lake', 'lakeside', 'island', 'islands', 'waterfall', 'rapids', 'river', 'mountain', 'valley', 'sunset', 'cloudy', 'crater', 'hillside', 'road'])) {
    return 'gallery.tag.landscapes'
  }

  if (hasToken(tokens, ['lodge', 'resort', 'breakfast', 'deck', 'lounge', 'vehicle', 'safari', 'boat'])) {
    return 'gallery.tag.safariLife'
  }

  return 'gallery.tag.safariLife'
}

const getSubjectFromTokens = (tokens: string[], fallbackTitle: string) => {
  if (hasToken(tokens, ['gorilla', 'silverback'])) {
    return 'Mountain gorilla behavior'
  }

  if (hasToken(tokens, ['chimpanzee', 'chimpanzees'])) {
    return 'Chimpanzee activity'
  }

  if (hasToken(tokens, ['lion', 'lioness', 'lionesses'])) {
    return 'Lion activity'
  }

  if (hasToken(tokens, ['leopard'])) {
    return 'Leopard sighting'
  }

  if (hasToken(tokens, ['cheetah'])) {
    return 'Cheetah movement'
  }

  if (hasToken(tokens, ['elephant', 'buffalo', 'giraffe', 'zebra', 'antelope', 'kudu', 'hippopotamus'])) {
    return 'Savannah wildlife sighting'
  }

  if (hasToken(tokens, ['shoebill', 'kingfisher', 'bird', 'birds', 'crane', 'cranes'])) {
    return 'Birdlife encounter'
  }

  if (hasToken(tokens, ['lodge', 'resort', 'breakfast', 'deck', 'lounge'])) {
    return 'Safari lodge experience'
  }

  if (hasToken(tokens, ['lake', 'island', 'islands', 'mountain', 'valley', 'waterfall', 'river', 'crater'])) {
    return 'Scenic route viewpoint'
  }

  if (hasToken(tokens, ['couple', 'friends', 'tourist', 'tourists', 'visitors', 'group'])) {
    return 'Traveler experience'
  }

  return fallbackTitle
}

const buildDescriptionForImage = (tokens: string[], title: string, tagKey: GalleryTagKey) => {
  const subject = getSubjectFromTokens(tokens, title)
  const isAerial = hasToken(tokens, ['aerial', 'drone'])
  const isClose = hasToken(tokens, ['portrait', 'closeup', 'close'])
  const isFamilyScene = hasToken(tokens, ['family', 'mother', 'infant', 'baby', 'cubs', 'cub', 'siblings', 'pair'])
  const isActionScene = hasToken(tokens, ['chasing', 'hunting', 'catching', 'ramming', 'clinging', 'bringing', 'sprinting', 'walking', 'crossing', 'drinking', 'feeding', 'resting', 'standing', 'dancing'])

  const baseByTag: Record<GalleryTagKey, string> = {
    'gallery.tag.primates':
      'captured in dense rainforest habitat typical of guided primate-tracking routes in Uganda.',
    'gallery.tag.bigCats':
      'captured during active game-drive moments across open savannah terrain.',
    'gallery.tag.birdlife':
      'from wetland and grassland ecosystems known for rewarding birdwatching.',
    'gallery.tag.landscapes':
      'highlighting natural terrain, water systems, and scenic overland viewpoints.',
    'gallery.tag.safariLife':
      'showing day-to-day wildlife and on-ground safari atmosphere on route.',
    'gallery.tag.culture':
      'showing people-focused moments that add context to the travel experience.',
  }

  const perspectivePrefix = isAerial ? 'Aerial view of' : isClose ? 'Close-up view of' : ''
  const normalizedSubject = perspectivePrefix
    ? `${subject.charAt(0).toLowerCase()}${subject.slice(1)}`
    : subject

  const firstSentence = perspectivePrefix
    ? `${perspectivePrefix} ${normalizedSubject} ${baseByTag[tagKey]}`
    : `${subject} ${baseByTag[tagKey]}`

  const secondSentence = (() => {
    if (isFamilyScene) {
      return 'Family interaction and social behavior are clearly visible in this frame.'
    }

    if (isActionScene) {
      return 'The scene captures real-time movement and wildlife behavior.'
    }

    if (isAerial) {
      return 'The elevated angle provides strong route and habitat context.'
    }

    if (isClose) {
      return 'Fine detail and texture are emphasized for close observation.'
    }

    return ''
  })()

  return `${firstSentence}${secondSentence ? ` ${secondSentence}` : ''}`
}

const buildAltForImage = (title: string, tagKey: GalleryTagKey) => {
  const suffixByTag: Record<GalleryTagKey, string> = {
    'gallery.tag.primates': 'primate scene',
    'gallery.tag.bigCats': 'big-cat scene',
    'gallery.tag.birdlife': 'birdlife scene',
    'gallery.tag.landscapes': 'landscape scene',
    'gallery.tag.safariLife': 'safari scene',
    'gallery.tag.culture': 'travel moment',
  }

  return `${title} - ${suffixByTag[tagKey]} in Uganda`
}

const galleryItems: GalleryItem[] = [
  ...featuredGalleryItems,
  ...extraGalleryImagePaths.map((image, index) => {
    const tokens = getImageTokens(image)
    const tagKey = getTagKeyFromTokens(tokens)
    const title = toReadableTitle(image)

    return {
      id: `extra-gallery-${index + 1}`,
      image,
      tagKey,
      title,
      description: buildDescriptionForImage(tokens, title, tagKey),
      alt: buildAltForImage(title, tagKey),
    }
  }),
]

const runtimeGeneratedGalleryItems = galleryItems.filter(
  (item) => !item.titleKey && !item.descriptionKey && !item.altKey,
)
const runtimeGeneratedTitleSeeds = runtimeGeneratedGalleryItems.map((item) => item.title ?? '')
const gallerySeoKeywordSeeds = [
  'Uganda safari gallery',
  'gorilla trekking photos',
  'Uganda wildlife images',
  'East Africa travel photography',
] as const

const totalGalleryItems = galleryItems.length
const INITIAL_GALLERY_BATCH_SIZE = 36
const GALLERY_BATCH_SIZE = 30

export function GalleryPage() {
  const { t } = useTranslation()
  const [visibleCount, setVisibleCount] = useState(INITIAL_GALLERY_BATCH_SIZE)
  const visibleGalleryItems = useMemo(
    () => galleryItems.slice(0, Math.min(visibleCount, totalGalleryItems)),
    [visibleCount],
  )
  const visibleRuntimeGeneratedItems = useMemo(
    () => visibleGalleryItems.filter((item) => !item.titleKey && !item.descriptionKey && !item.altKey),
    [visibleGalleryItems],
  )
  const visibleRuntimeTitleSeeds = useMemo(
    () => visibleRuntimeGeneratedItems.map((item) => item.title ?? ''),
    [visibleRuntimeGeneratedItems],
  )
  const visibleRuntimeDescriptionSeeds = useMemo(
    () => visibleRuntimeGeneratedItems.map((item) => item.description ?? ''),
    [visibleRuntimeGeneratedItems],
  )
  const visibleRuntimeAltSeeds = useMemo(
    () => visibleRuntimeGeneratedItems.map((item) => item.alt ?? ''),
    [visibleRuntimeGeneratedItems],
  )
  const translatedRuntimeTitles = useRuntimeTranslatedList(visibleRuntimeTitleSeeds)
  const translatedRuntimeDescriptions = useRuntimeTranslatedList(visibleRuntimeDescriptionSeeds)
  const translatedRuntimeAlts = useRuntimeTranslatedList(visibleRuntimeAltSeeds)
  const translatedSeoKeywords = useRuntimeTranslatedList(gallerySeoKeywordSeeds)
  const galleryEntityKeywords = useMemo(
    () =>
      buildEntityKeywordCluster(
        'destination',
        [
          'gorilla trekking photos Uganda',
          'Uganda safari wildlife gallery',
          'Bwindi gorilla photo safari',
          ...runtimeGeneratedTitleSeeds.slice(0, 20),
        ],
        34,
      ),
    [],
  )
  const galleryPageKeywordCluster = useMemo(
    () =>
      buildPageKeywordCluster(
        [...translatedSeoKeywords, ...UGANDA_SAFARI_KEYWORDS],
        GORILLA_TREKKING_KEYWORDS,
        galleryEntityKeywords,
        120,
      ),
    [galleryEntityKeywords, translatedSeoKeywords],
  )
  const runtimeFieldsById = useMemo(() => {
    const titleById = new Map<string, string>()
    const descriptionById = new Map<string, string>()
    const altById = new Map<string, string>()

    visibleRuntimeGeneratedItems.forEach((item, index) => {
      titleById.set(item.id, translatedRuntimeTitles[index] ?? visibleRuntimeTitleSeeds[index] ?? '')
      descriptionById.set(
        item.id,
        translatedRuntimeDescriptions[index] ?? visibleRuntimeDescriptionSeeds[index] ?? '',
      )
      altById.set(item.id, translatedRuntimeAlts[index] ?? visibleRuntimeAltSeeds[index] ?? '')
    })

    return { titleById, descriptionById, altById }
  }, [
    translatedRuntimeAlts,
    translatedRuntimeDescriptions,
    translatedRuntimeTitles,
    visibleRuntimeAltSeeds,
    visibleRuntimeDescriptionSeeds,
    visibleRuntimeGeneratedItems,
    visibleRuntimeTitleSeeds,
  ])
  const requestTourUrl = '/tours?openCustomTour=1#custom-tour-request'
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activeItem = activeIndex !== null ? galleryItems[activeIndex] : null
  const currentModalIndex = activeIndex ?? 0
  const hasMoreGalleryItems = visibleCount < totalGalleryItems
  const getItemTitle = (item: GalleryItem) =>
    item.titleKey ? t(item.titleKey) : runtimeFieldsById.titleById.get(item.id) ?? item.title ?? ''
  const getItemDescription = (item: GalleryItem) =>
    item.descriptionKey
      ? t(item.descriptionKey)
      : runtimeFieldsById.descriptionById.get(item.id) ?? item.description ?? ''
  const getItemAlt = (item: GalleryItem) =>
    item.altKey ? t(item.altKey) : runtimeFieldsById.altById.get(item.id) ?? item.alt ?? ''
  const handleLoadMoreGalleryItems = useCallback(() => {
    setVisibleCount((current) => Math.min(totalGalleryItems, current + GALLERY_BATCH_SIZE))
  }, [])

  usePageSeo({
    title: t('gallery.heroTitle'),
    description: t('gallery.heroDescription'),
    path: '/gallery',
    image: '/images/gorilla-family-in-forest-0075.jpg',
    imageAlt: 'Uganda safari wildlife gallery and gorilla trekking images',
    preloadImage: '/images/gorilla-family-in-forest-0075.jpg',
    keywords: galleryPageKeywordCluster,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('gallery.heroTitle'),
      description: t('gallery.heroDescription'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: galleryItems.slice(0, 25).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: getItemTitle(item),
        })),
      },
    },
  })

  const closeModal = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return current
      }

      return (current - 1 + totalGalleryItems) % totalGalleryItems
    })
  }, [])

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return current
      }

      return (current + 1) % totalGalleryItems
    })
  }, [])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, closeModal, showNext, showPrevious])

  return (
    <>
      <PageHero
        eyebrow={t('gallery.heroEyebrow')}
        title={t('gallery.heroTitle')}
        description={t('gallery.heroDescription')}
        className="hero-actions-centered hero-actions-bottom"
        actions={[
          { label: t('gallery.heroActionContact'), to: requestTourUrl },
          { label: t('gallery.heroActionTours'), to: '/tours', variant: 'secondary' },
        ]}
        highlights={[t('gallery.heroHighlight1'), t('gallery.heroHighlight2'), t('gallery.heroHighlight3')]}
        panel={{
          title: t('gallery.heroPanelTitle'),
          points: [
            t('gallery.heroPanelPoint1'),
            t('gallery.heroPanelPoint2'),
            t('gallery.heroPanelPoint3'),
          ],
        }}
        backgroundImages={heroBackgroundImages}
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            title={t('gallery.collectionTitle')}
            subtitle={t('gallery.collectionSubtitle')}
          />

          <div className="card-grid gallery-grid">
            {visibleGalleryItems.map((item, index) => (
              <article key={item.id} className="gallery-card">
                <button
                  type="button"
                  className="gallery-media gallery-media-button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${t('gallery.modal.openImage')} ${index + 1}`}
                >
                  <img
                    src={item.image}
                    alt={getItemAlt(item)}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width={1200}
                    height={900}
                  />
                </button>
                <div className="gallery-caption">
                  <p className="gallery-tag">{t(item.tagKey)}</p>
                  <h3>{getItemTitle(item)}</h3>
                  <p>{getItemDescription(item)}</p>
                </div>
              </article>
            ))}
          </div>
          {hasMoreGalleryItems ? (
            <div className="section-actions gallery-load-more">
              <button type="button" className="btn btn-secondary" onClick={handleLoadMoreGalleryItems}>
                Load more photos ({visibleCount}/{totalGalleryItems})
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {activeItem ? (
        <div
          className="gallery-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={t('gallery.modal.dialogLabel')}
          onClick={closeModal}
        >
          <div className="gallery-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="gallery-modal-close"
              onClick={closeModal}
              aria-label={t('gallery.modal.close')}
            >
              X
            </button>
            <button
              type="button"
              className="gallery-modal-nav gallery-modal-nav-prev"
              onClick={showPrevious}
              aria-label={t('gallery.modal.previous')}
            >
              {'<'}
            </button>
            <div className="gallery-modal-media">
              <img
                src={activeItem.image}
                alt={getItemAlt(activeItem)}
                decoding="async"
                width={1920}
                height={1280}
              />
            </div>
            <button
              type="button"
              className="gallery-modal-nav gallery-modal-nav-next"
              onClick={showNext}
              aria-label={t('gallery.modal.next')}
            >
              {'>'}
            </button>
            <div className="gallery-modal-caption">
              <p className="gallery-tag">{t(activeItem.tagKey)}</p>
              <h3>{getItemTitle(activeItem)}</h3>
              <p>{getItemDescription(activeItem)}</p>
              <p className="gallery-modal-count">
                {currentModalIndex + 1} / {totalGalleryItems}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

