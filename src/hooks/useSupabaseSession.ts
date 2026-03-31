import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabaseClient'

let cachedSession: Session | null = null
let authListenerReady = false
let authCodeExchangeAttempted = false
const listeners = new Set<(session: Session | null) => void>()

const notifyListeners = (session: Session | null) => {
  listeners.forEach((listener) => listener(session))
}

const ensureAuthListener = () => {
  const supabaseClient = supabase

  if (authListenerReady || !supabaseClient) {
    return
  }

  authListenerReady = true

  const hydrateSession = async () => {
    if (typeof window !== 'undefined' && !authCodeExchangeAttempted) {
      authCodeExchangeAttempted = true
      const url = new URL(window.location.href)
      const authCode = url.searchParams.get('code')

      if (authCode) {
        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(authCode)

        if (!error) {
          cachedSession = data.session ?? cachedSession
          notifyListeners(cachedSession)
        }

        url.searchParams.delete('code')
        url.searchParams.delete('type')
        url.searchParams.delete('error')
        url.searchParams.delete('error_description')
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
      }
    }

    if (!cachedSession) {
      const { data } = await supabaseClient.auth.getSession()
      cachedSession = data.session
      notifyListeners(cachedSession)
    }
  }

  hydrateSession().catch(() => {
    notifyListeners(cachedSession)
  })

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    cachedSession = session
    notifyListeners(session)
  })
}

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(cachedSession)

  useEffect(() => {
    if (!supabase) {
      return
    }

    ensureAuthListener()
    listeners.add(setSession)

    return () => {
      listeners.delete(setSession)
    }
  }, [])

  return session
}
