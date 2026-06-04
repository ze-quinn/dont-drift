import { createClient } from '@supabase/supabase-js'

const url   = import.meta.env.VITE_SUPABASE_URL
const anon  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.warn('Supabase env vars not set — cloud sync disabled')
}

export const supabase = createClient(url ?? '', anon ?? '')
