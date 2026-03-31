import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  ''
).trim()
const normalizedSupabaseUrl =
  rawSupabaseUrl.length > 0 && !/^https?:\/\//i.test(rawSupabaseUrl)
    ? `https://${rawSupabaseUrl}`
    : rawSupabaseUrl

let supabaseClient: SupabaseClient | null = null

if (normalizedSupabaseUrl.length > 0 && supabaseAnonKey.length > 0) {
  try {
    supabaseClient = createClient(normalizedSupabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn('[supabase] Invalid configuration; Supabase disabled.', error)
    supabaseClient = null
  }
}

export const supabase = supabaseClient
export const isSupabaseConfigured = Boolean(supabaseClient)
