import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'toursticdz-auth',
        // Bypass Web Locks API to prevent AbortError in React Strict Mode
        // while still calling the session callback correctly
        lock: async (name, acquireTimeout, fn) => await fn()
    }
})
