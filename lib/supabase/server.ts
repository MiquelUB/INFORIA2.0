// lib/supabase/server.ts
// D:\iNFORiA\SaaS\INFORIA2.0\lib\supabase\server.ts

// Importar CookieOptions para tipado explícito
import { createServerClient, type CookieOptions } from '@supabase/ssr' 
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Crea un cliente de Supabase para el LADO DEL SERVIDOR (Server Components, Route Handlers)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Añadir tipado explícito a las opciones
        set(name: string, value: string, options: CookieOptions) { 
          cookieStore.set({ name, value, ...options })
        },
        // CORRECCIÓN: Usar .delete() en lugar de .set() con valor vacío
        remove(name: string, options: CookieOptions) { 
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}