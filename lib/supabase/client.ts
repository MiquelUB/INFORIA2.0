// D:\iNFORiA\SaaS\INFORIA2.0\lib\supabase\client.ts

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Crea un cliente de Supabase para el LADO DEL CLIENTE (Navegador)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}