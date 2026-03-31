import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { useTranslation } from '../context/useTranslation'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

type TourRouteMapProps = {
  stops: string[]
}

type RoutePoint = {
  label: string
  lat: number
  lng: number
}

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search'
const DEFAULT_VIEW: [number, number] = [1.373333, 32.290275]
const DEFAULT_ZOOM = 6
const REQUEST_DELAY_MS = 1100
const STOP_ALIASES: Record<string, string> = {
  'Bigodi Wetland Sanctuary, Uganda': 'Bigodi Wetland Sanctuary, Kibale, Uganda',
  'Ishasha Sector, Queen Elizabeth National Park, Uganda':
    'Ishasha, Queen Elizabeth National Park, Uganda',
  'Kazinga Channel, Uganda': 'Kazinga Channel, Queen Elizabeth National Park, Uganda',
  'Rushaga Sector, Bwindi Impenetrable National Park, Uganda':
    'Rushaga, Bwindi Impenetrable National Park, Uganda',
  'Sipi Falls, Uganda': 'Sipi Falls, Kapchorwa, Uganda',
  'Ziwa Rhino Sanctuary, Uganda': 'Ziwa Rhino Sanctuary, Nakasongola, Uganda',
}

const getStopCacheKey = (label: string) => `route-stop:${label.toLowerCase()}`

const readCachedStop = (label: string): RoutePoint | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cachedValue = window.localStorage.getItem(getStopCacheKey(label))
    if (!cachedValue) {
      return null
    }

    const parsed = JSON.parse(cachedValue) as RoutePoint
    if (
      typeof parsed?.lat === 'number' &&
      typeof parsed?.lng === 'number' &&
      typeof parsed?.label === 'string'
    ) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

const writeCachedStop = (point: RoutePoint) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(getStopCacheKey(point.label), JSON.stringify(point))
  } catch {
    // Ignore cache write errors (storage limits, privacy mode, etc.)
  }
}

const buildNominatimUrl = (label: string) => {
  const query = STOP_ALIASES[label] ?? label
  const params = new URLSearchParams({
    format: 'json',
    q: query,
    limit: '1',
    addressdetails: '0',
    countrycodes: 'ug',
  })

  const contactEmail = import.meta.env.VITE_BUSINESS_CONTACT_EMAIL
  if (typeof contactEmail === 'string' && contactEmail.trim().length > 0) {
    params.set('email', contactEmail.trim())
  }

  return `${NOMINATIM_ENDPOINT}?${params.toString()}`
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const geocodeStop = async (
  label: string,
): Promise<{ point: RoutePoint | null; fromCache: boolean }> => {
  const cached = readCachedStop(label)
  if (cached) {
    return { point: cached, fromCache: true }
  }

  const response = await fetch(buildNominatimUrl(label))
  if (!response.ok) {
    return { point: null, fromCache: false }
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>
  const first = data[0]
  if (!first) {
    return { point: null, fromCache: false }
  }

  const lat = Number.parseFloat(first.lat)
  const lng = Number.parseFloat(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { point: null, fromCache: false }
  }

  const point = { label, lat, lng }
  writeCachedStop(point)
  return { point, fromCache: false }
}

export function TourRouteMap({ stops }: TourRouteMapProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [resolvedStops, setResolvedStops] = useState<RoutePoint[]>([])
  const uniqueStops = useMemo(
    () =>
      stops
        .map((stop) => stop.trim())
        .filter(Boolean)
        .reduce<string[]>((accumulator, stop) => {
          if (accumulator[accumulator.length - 1] === stop) {
            return accumulator
          }

          accumulator.push(stop)
          return accumulator
        }, []),
    [stops],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const container = containerRef.current as HTMLDivElement & { _leaflet_id?: number }
    if (container._leaflet_id) {
      delete container._leaflet_id
      container.innerHTML = ''
    }

    const map = L.map(container, {
      scrollWheelZoom: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    map.setView(DEFAULT_VIEW, DEFAULT_ZOOM)
    window.setTimeout(() => {
      map.invalidateSize()
    }, 0)

    mapRef.current = map
    routeLayerRef.current = L.layerGroup().addTo(map)
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            map.invalidateSize()
          })
    if (resizeObserver) {
      resizeObserver.observe(container)
    }

    return () => {
      resizeObserver?.disconnect()
      map.remove()
      mapRef.current = null
      routeLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current) {
      return
    }

    routeLayerRef.current.clearLayers()
    mapRef.current.setView(DEFAULT_VIEW, DEFAULT_ZOOM)
  }, [uniqueStops])

  useEffect(() => {
    let isActive = true

    const resolveStops = async () => {
      if (!uniqueStops.length) {
        setStatus('error')
        setResolvedStops([])
        return
      }

      setStatus('loading')
      const collected: RoutePoint[] = []
      for (let index = 0; index < uniqueStops.length; index += 1) {
        const stop = uniqueStops[index]
        try {
          const { point, fromCache } = await geocodeStop(stop)
          if (point) {
            collected.push(point)
          }

          if (!fromCache && index < uniqueStops.length - 1) {
            await delay(REQUEST_DELAY_MS)
          }
        } catch {
          // Ignore per-stop errors; we'll handle if nothing resolves.
        }
      }

      if (!isActive) {
        return
      }

      if (!collected.length) {
        setStatus('error')
        setResolvedStops([])
        return
      }

      setResolvedStops(collected)
      setStatus('ready')
    }

    void resolveStops()

    return () => {
      isActive = false
    }
  }, [uniqueStops])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !routeLayerRef.current || !resolvedStops.length) {
      return
    }

    const map = mapRef.current
    const layerGroup = routeLayerRef.current
    layerGroup.clearLayers()

    resolvedStops.forEach((stop) => {
      L.marker([stop.lat, stop.lng])
        .addTo(layerGroup)
        .bindPopup(stop.label)
    })

    if (resolvedStops.length > 1) {
      const line = L.polyline(
        resolvedStops.map((stop) => [stop.lat, stop.lng] as [number, number]),
        {
          color: '#3f6b46',
          weight: 4,
          opacity: 0.9,
        },
      )
      line.addTo(layerGroup)
    }

    if (resolvedStops.length === 1) {
      map.setView([resolvedStops[0].lat, resolvedStops[0].lng], 9)
      return
    }

    const bounds = L.latLngBounds(resolvedStops.map((stop) => [stop.lat, stop.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [30, 30] })
  }, [status, resolvedStops])

  return (
    <div className="tour-route-map">
      <div className="tour-route-map-frame" ref={containerRef} />
      {status === 'loading' ? (
        <p className="tour-route-map-status">{t('tourDetail.mapLoading')}</p>
      ) : null}
      {status === 'error' ? (
        <p className="tour-route-map-status">{t('tourDetail.mapError')}</p>
      ) : null}
      <p className="tour-route-map-note">{t('tourDetail.mapNote')}</p>
    </div>
  )
}
