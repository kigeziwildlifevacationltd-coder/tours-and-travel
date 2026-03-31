import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const host = process.env.TOUR_RATING_HOST?.trim() || '127.0.0.1'
const port = Number.parseInt(process.env.TOUR_RATING_PORT ?? '8787', 10)
const dataFilePath = resolve(
  process.cwd(),
  process.env.TOUR_RATING_DATA_FILE?.trim() || 'storage/tour-ratings.json',
)
const requiredApiKey = process.env.TOUR_RATING_API_KEY?.trim() || ''
const maxBodyBytes = 64 * 1024
const defaultHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Cache-Control': 'no-store',
}

/**
 * @typedef {Record<string, number>} TourRatingsByUser
 * @typedef {Record<string, TourRatingsByUser>} TourRatingsStore
 */

/** @type {TourRatingsStore} */
let ratingsStore = {}
let persistQueue = Promise.resolve()

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    ...defaultHeaders,
    'Content-Type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify(payload))
}

function normalizeIdentifier(value, label) {
  if (typeof value !== 'string') {
    return { ok: false, error: `${label} must be a string.` }
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return { ok: false, error: `${label} is required.` }
  }

  if (trimmed.length > 160) {
    return { ok: false, error: `${label} is too long.` }
  }

  return { ok: true, value: trimmed }
}

function normalizeRating(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const rounded = Math.round(value)
  return rounded >= 1 && rounded <= 5 ? rounded : null
}

function sanitizeStore(raw) {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  /** @type {TourRatingsStore} */
  const nextStore = {}

  for (const [tourId, ratingsByUser] of Object.entries(raw)) {
    if (!ratingsByUser || typeof ratingsByUser !== 'object') {
      continue
    }

    /** @type {TourRatingsByUser} */
    const normalizedByUser = {}

    for (const [userId, ratingValue] of Object.entries(ratingsByUser)) {
      const normalizedUserId = normalizeIdentifier(userId, 'userId')
      const normalizedRatingValue = normalizeRating(ratingValue)

      if (!normalizedUserId.ok || normalizedRatingValue === null) {
        continue
      }

      normalizedByUser[normalizedUserId.value] = normalizedRatingValue
    }

    if (Object.keys(normalizedByUser).length > 0) {
      nextStore[tourId] = normalizedByUser
    }
  }

  return nextStore
}

function getTourSnapshot(tourId, userId) {
  const byUser = ratingsStore[tourId] ?? {}
  const ratings = Object.values(byUser)
  const totalRatings = ratings.length
  const totalScore = ratings.reduce((sum, rating) => sum + rating, 0)
  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0

  return {
    tourId,
    userRating: byUser[userId] ?? 0,
    averageRating,
    totalRatings,
  }
}

function setUserRating(tourId, userId, rating) {
  const byUser = ratingsStore[tourId] ?? {}
  ratingsStore = {
    ...ratingsStore,
    [tourId]: {
      ...byUser,
      [userId]: rating,
    },
  }
}

function clearUserRating(tourId, userId) {
  const byUser = ratingsStore[tourId]

  if (!byUser || typeof byUser[userId] !== 'number') {
    return
  }

  const nextByUser = { ...byUser }
  delete nextByUser[userId]

  const nextStore = { ...ratingsStore }

  if (Object.keys(nextByUser).length === 0) {
    delete nextStore[tourId]
  } else {
    nextStore[tourId] = nextByUser
  }

  ratingsStore = nextStore
}

function persistStore() {
  const payload = JSON.stringify(ratingsStore, null, 2)

  persistQueue = persistQueue
    .then(async () => {
      await mkdir(dirname(dataFilePath), { recursive: true })
      await writeFile(dataFilePath, payload, 'utf8')
    })
    .catch((error) => {
      console.error('[tour-rating-server] Persist failed:', error)
    })

  return persistQueue
}

async function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let rawBody = ''
    let hasRejected = false

    req.setEncoding('utf8')

    req.on('data', (chunk) => {
      rawBody += chunk

      if (!hasRejected && rawBody.length > maxBodyBytes) {
        hasRejected = true
        rejectBody(new Error('Request body is too large.'))
        req.destroy()
      }
    })

    req.on('error', (error) => {
      if (!hasRejected) {
        hasRejected = true
        rejectBody(error)
      }
    })

    req.on('end', () => {
      if (hasRejected) {
        return
      }

      if (!rawBody.trim()) {
        resolveBody({})
        return
      }

      try {
        resolveBody(JSON.parse(rawBody))
      } catch {
        rejectBody(new Error('Invalid JSON body.'))
      }
    })
  })
}

async function loadStore() {
  try {
    const fileContents = await readFile(dataFilePath, 'utf8')
    ratingsStore = sanitizeStore(JSON.parse(fileContents))
  } catch (error) {
    const fileError = /** @type {{ code?: string }} */ (error)
    if (fileError.code !== 'ENOENT') {
      console.warn('[tour-rating-server] Failed to read existing store. Starting fresh.')
    }
    ratingsStore = {}
  }
}

function validateApiKey(req) {
  if (requiredApiKey.length === 0) {
    return true
  }

  const providedKey = req.headers['x-api-key']
  return typeof providedKey === 'string' && providedKey === requiredApiKey
}

await loadStore()

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Invalid request URL.' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, defaultHeaders)
    res.end()
    return
  }

  if (!validateApiKey(req)) {
    sendJson(res, 401, { error: 'Unauthorized.' })
    return
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)

  if (requestUrl.pathname !== '/api/tour-ratings') {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const normalizedTourId = normalizeIdentifier(requestUrl.searchParams.get('tourId'), 'tourId')
      const normalizedUserId = normalizeIdentifier(requestUrl.searchParams.get('userId'), 'userId')

      if (!normalizedTourId.ok || !normalizedUserId.ok) {
        sendJson(res, 400, { error: 'tourId and userId query params are required.' })
        return
      }

      sendJson(res, 200, getTourSnapshot(normalizedTourId.value, normalizedUserId.value))
      return
    }

    if (req.method === 'PUT') {
      const body = /** @type {{ tourId?: unknown, userId?: unknown, rating?: unknown }} */ (
        await readJsonBody(req)
      )
      const normalizedTourId = normalizeIdentifier(body.tourId, 'tourId')
      const normalizedUserId = normalizeIdentifier(body.userId, 'userId')
      const normalizedRating = normalizeRating(body.rating)

      if (!normalizedTourId.ok || !normalizedUserId.ok || normalizedRating === null) {
        sendJson(res, 400, { error: 'tourId, userId, and rating (1-5) are required.' })
        return
      }

      setUserRating(normalizedTourId.value, normalizedUserId.value, normalizedRating)
      await persistStore()
      sendJson(res, 200, getTourSnapshot(normalizedTourId.value, normalizedUserId.value))
      return
    }

    if (req.method === 'DELETE') {
      const body = /** @type {{ tourId?: unknown, userId?: unknown }} */ (await readJsonBody(req))
      const normalizedTourId = normalizeIdentifier(body.tourId, 'tourId')
      const normalizedUserId = normalizeIdentifier(body.userId, 'userId')

      if (!normalizedTourId.ok || !normalizedUserId.ok) {
        sendJson(res, 400, { error: 'tourId and userId are required.' })
        return
      }

      clearUserRating(normalizedTourId.value, normalizedUserId.value)
      await persistStore()
      sendJson(res, 200, getTourSnapshot(normalizedTourId.value, normalizedUserId.value))
      return
    }

    sendJson(res, 405, { error: 'Method not allowed.' })
  } catch (error) {
    console.error('[tour-rating-server] Request failed:', error)
    sendJson(res, 500, { error: 'Internal server error.' })
  }
})

server.listen(port, host, () => {
  console.log(`[tour-rating-server] Running on http://${host}:${port}/api/tour-ratings`)
  console.log(`[tour-rating-server] Data file: ${dataFilePath}`)
})

