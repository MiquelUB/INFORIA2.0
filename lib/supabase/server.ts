// lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr' 
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) { 
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Los cookies pueden no ser editables en algunos contextos
            console.error(`Error setting cookie ${name}:`, error)
          }
        },
        remove(name: string, options: CookieOptions) { 
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Los cookies pueden no ser editables en algunos contextos
            console.error(`Error removing cookie ${name}:`, error)
          }
        },
      },
    }
  )
}