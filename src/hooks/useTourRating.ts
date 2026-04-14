import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../utils/supabaseClient'
import { useSupabaseSession } from './useSupabaseSession'

const ratingStorageKey = 'awv-tour-ratings-v1'
const ratingUserStorageKey = 'awv-tour-rating-user-id-v1'
const ratingUpdatedEventName = 'awv-tour-ratings-updated'

type TourRatingsByUser = Record<string, number>
type TourRatingsStore = Record<string, TourRatingsByUser>

type TourRatingSnapshot = {
  userRating: number
  averageRating: number
  totalRatings: number
}

type SupabaseRatingRow = {
  rating: number
  user_id: string
}

function normalizeRating(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const rounded = Math.round(value)
  return rounded >= 1 && rounded <= 5 ? rounded : null
}

function normalizeAverage(value: number, totalRatings: number): number {
  if (totalRatings === 0) {
    return 0
  }

  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(5, Math.max(0, value))
}

async function fetchSupabaseSnapshot(
  tourId: string,
  userId?: string | null,
  signal?: AbortSignal,
): Promise<TourRatingSnapshot | null> {
  if (!supabase) {
    return null
  }

  const query = supabase.from('tour_ratings').select('rating, user_id').eq('tour_id', tourId)

  if (signal) {
    query.abortSignal(signal)
  }

  const { data, error } = await query

  if (error) {
    console.warn('[ratings] Failed to load ratings.', error)
    return null
  }

  const rows = (data ?? []) as SupabaseRatingRow[]
  const totalRatings = rows.length
  const totalScore = rows.reduce((sum, row) => sum + row.rating, 0)
  const averageRating = normalizeAverage(totalScore / Math.max(1, totalRatings), totalRatings)
  const userRating = userId
    ? rows.find((row) => row.user_id === userId)?.rating ?? 0
    : 0

  return {
    userRating,
    averageRating,
    totalRatings,
  }
}

async function upsertSupabaseRating(
  tourId: string,
  userId: string,
  rating: number,
): Promise<TourRatingSnapshot | null> {
  if (!supabase) {
    return null
  }

  const { error } = await supabase
    .from('tour_ratings')
    .upsert({ tour_id: tourId, user_id: userId, rating }, { onConflict: 'tour_id,user_id' })

  if (error) {
    console.warn('[ratings] Failed to save rating.', error)
    return null
  }

  return fetchSupabaseSnapshot(tourId, userId)
}

async function removeSupabaseRating(tourId: string, userId: string): Promise<TourRatingSnapshot | null> {
  if (!supabase) {
    return null
  }

  const { error } = await supabase
    .from('tour_ratings')
    .delete()
    .eq('tour_id', tourId)
    .eq('user_id', userId)

  if (error) {
    console.warn('[ratings] Failed to remove rating.', error)
    return null
  }

  return fetchSupabaseSnapshot(tourId, userId)
}

function generateUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `rating-user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getOrCreateRatingUserId(): string {
  if (typeof window === 'undefined') {
    return 'server-render-user'
  }

  const existingUserId = window.localStorage.getItem(ratingUserStorageKey)

  if (existingUserId) {
    return existingUserId
  }

  const nextUserId = generateUserId()

  try {
    window.localStorage.setItem(ratingUserStorageKey, nextUserId)
  } catch {
    // Ignore storage errors.
  }

  return nextUserId
}

function parseTourRatingsStore(raw: string | null, activeUserId: string): TourRatingsStore {
  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>

    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    const normalizedStore: TourRatingsStore = {}

    for (const [tourId, value] of Object.entries(parsed)) {
      if (typeof value === 'number') {
        const legacyRating = normalizeRating(value)

        if (legacyRating) {
          normalizedStore[tourId] = { [activeUserId]: legacyRating }
        }

        continue
      }

      if (!value || typeof value !== 'object') {
        continue
      }

      const byUser = value as Record<string, unknown>
      const normalizedByUser: TourRatingsByUser = {}

      for (const [userId, userRating] of Object.entries(byUser)) {
        const normalizedUserRating = normalizeRating(userRating)

        if (normalizedUserRating) {
          normalizedByUser[userId] = normalizedUserRating
        }
      }

      if (Object.keys(normalizedByUser).length > 0) {
        normalizedStore[tourId] = normalizedByUser
      }
    }

    return normalizedStore
  } catch {
    return {}
  }
}

function readTourRatingsStore(activeUserId: string): TourRatingsStore {
  if (typeof window === 'undefined') {
    return {}
  }

  return parseTourRatingsStore(window.localStorage.getItem(ratingStorageKey), activeUserId)
}

function writeTourRatingsStore(nextStore: TourRatingsStore) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(ratingStorageKey, JSON.stringify(nextStore))
  } catch {
    // Ignore storage errors.
  }
}

function notifyRatingsUpdated() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(ratingUpdatedEventName))
}

function createSnapshot(
  store: TourRatingsStore,
  tourId: string,
  activeUserId: string,
): TourRatingSnapshot {
  const byUser = store[tourId] ?? {}
  const ratings = Object.values(byUser)
  const totalRatings = ratings.length
  const totalScore = ratings.reduce((sum, rating) => sum + rating, 0)
  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0

  return {
    userRating: byUser[activeUserId] ?? 0,
    averageRating,
    totalRatings,
  }
}

function withUserRating(
  store: TourRatingsStore,
  tourId: string,
  userId: string,
  nextRating: number,
): TourRatingsStore {
  const currentByUser = store[tourId] ?? {}
  const currentRating = currentByUser[userId] ?? 0
  const normalizedNextRating = normalizeRating(nextRating) ?? 0

  if (currentRating === normalizedNextRating) {
    return store
  }

  const nextByUser: TourRatingsByUser = { ...currentByUser }
  const nextStore: TourRatingsStore = { ...store }

  if (normalizedNextRating > 0) {
    nextByUser[userId] = normalizedNextRating
  } else {
    delete nextByUser[userId]
  }

  if (Object.keys(nextByUser).length > 0) {
    nextStore[tourId] = nextByUser
  } else {
    delete nextStore[tourId]
  }

  return nextStore
}

function applyRatingToSnapshot(snapshot: TourRatingSnapshot, nextRating: number): TourRatingSnapshot {
  const previousRating = snapshot.userRating
  const previousTotalRatings = snapshot.totalRatings
  const previousTotalScore = snapshot.averageRating * previousTotalRatings
  const nextTotalRatings = previousRating > 0 ? previousTotalRatings : previousTotalRatings + 1
  const nextTotalScore =
    previousRating > 0 ? previousTotalScore - previousRating + nextRating : previousTotalScore + nextRating
  const nextAverageRating = nextTotalRatings > 0 ? nextTotalScore / nextTotalRatings : 0

  return {
    userRating: nextRating,
    averageRating: Math.min(5, Math.max(0, nextAverageRating)),
    totalRatings: nextTotalRatings,
  }
}

function removeRatingFromSnapshot(snapshot: TourRatingSnapshot): TourRatingSnapshot {
  if (snapshot.userRating === 0 || snapshot.totalRatings === 0) {
    return snapshot
  }

  const previousTotalScore = snapshot.averageRating * snapshot.totalRatings
  const nextTotalRatings = Math.max(0, snapshot.totalRatings - 1)
  const nextTotalScore = Math.max(0, previousTotalScore - snapshot.userRating)
  const nextAverageRating = nextTotalRatings > 0 ? nextTotalScore / nextTotalRatings : 0

  return {
    userRating: 0,
    averageRating: Math.min(5, Math.max(0, nextAverageRating)),
    totalRatings: nextTotalRatings,
  }
}

export function useTourRating(tourId: string) {
  const session = useSupabaseSession()
  const [userId] = useState(() => getOrCreateRatingUserId())
  const [store, setStore] = useState<TourRatingsStore>(() => readTourRatingsStore(userId))
  const [snapshot, setSnapshot] = useState<TourRatingSnapshot>(() =>
    isSupabaseConfigured ? { userRating: 0, averageRating: 0, totalRatings: 0 } : createSnapshot(store, tourId, userId),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mutationSequence = useRef(0)
  const localSnapshot = useMemo<TourRatingSnapshot>(() => createSnapshot(store, tourId, userId), [
    store,
    tourId,
    userId,
  ])
  const canRate = isSupabaseConfigured ? Boolean(session) : true

  const persistLocalRating = useCallback(
    (nextRating: number): TourRatingsStore => {
      const currentStore = readTourRatingsStore(userId)
      const nextStore = withUserRating(currentStore, tourId, userId, nextRating)

      if (nextStore === currentStore) {
        return currentStore
      }

      writeTourRatingsStore(nextStore)
      setStore(nextStore)
      notifyRatingsUpdated()
      return nextStore
    },
    [tourId, userId],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || isSupabaseConfigured) {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ratingStorageKey) {
        return
      }

      setStore(readTourRatingsStore(userId))
    }
    const handleRatingUpdated = () => {
      setStore(readTourRatingsStore(userId))
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(ratingUpdatedEventName, handleRatingUpdated)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(ratingUpdatedEventName, handleRatingUpdated)
    }
  }, [userId])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSnapshot(localSnapshot)
    }
  }, [localSnapshot])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    const controller = new AbortController()
    const activeUserId = session?.user.id ?? null

    void fetchSupabaseSnapshot(tourId, activeUserId, controller.signal)
      .then((nextSnapshot) => {
        if (!nextSnapshot || controller.signal.aborted) {
          return
        }

        setSnapshot(nextSnapshot)
      })
      .catch(() => {
        // handled in fetch
      })

    return () => {
      controller.abort()
    }
  }, [tourId, session?.user.id])

  const setTourRating = useCallback(
    (nextRating: number) => {
      const normalizedRating = normalizeRating(nextRating)

      if (!normalizedRating || snapshot.userRating === normalizedRating) {
        return
      }

      if (!isSupabaseConfigured || !supabase) {
        const nextLocalStore = persistLocalRating(normalizedRating)
        setSnapshot(createSnapshot(nextLocalStore, tourId, userId))
        return
      }

      if (!session) {
        return
      }

      const optimisticBase = applyRatingToSnapshot(snapshot, normalizedRating)
      setSnapshot(optimisticBase)

      const mutationId = mutationSequence.current + 1
      mutationSequence.current = mutationId
      setIsSubmitting(true)

      void upsertSupabaseRating(tourId, session.user.id, normalizedRating)
        .then((nextSnapshot) => {
          if (!nextSnapshot || mutationId !== mutationSequence.current) {
            return
          }

          setSnapshot(nextSnapshot)
        })
        .finally(() => {
          if (mutationId === mutationSequence.current) {
            setIsSubmitting(false)
          }
        })
    },
    [persistLocalRating, session, snapshot, tourId, userId],
  )

  const clearTourRating = useCallback(() => {
    if (snapshot.userRating === 0) {
      return
    }

    if (!isSupabaseConfigured || !supabase) {
      const nextLocalStore = persistLocalRating(0)
      setSnapshot(createSnapshot(nextLocalStore, tourId, userId))
      return
    }

    if (!session) {
      return
    }

    const optimisticBase = removeRatingFromSnapshot(snapshot)
    setSnapshot(optimisticBase)

    const mutationId = mutationSequence.current + 1
    mutationSequence.current = mutationId
    setIsSubmitting(true)

    void removeSupabaseRating(tourId, session.user.id)
      .then((nextSnapshot) => {
        if (!nextSnapshot || mutationId !== mutationSequence.current) {
          return
        }

        setSnapshot(nextSnapshot)
      })
      .finally(() => {
        if (mutationId === mutationSequence.current) {
          setIsSubmitting(false)
        }
      })
  }, [persistLocalRating, session, snapshot, tourId, userId])

  return {
    userRating: snapshot.userRating,
    averageRating: snapshot.averageRating,
    totalRatings: snapshot.totalRatings,
    isSubmitting,
    canRate,
    setTourRating,
    clearTourRating,
  }
}
