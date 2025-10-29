// D:\iNFORiA\SaaS\INFORIA2.0\lib\supabase\client.ts

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types' // ✅ CORRECCIÓN: Importar el tipo Database desde '../types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} // ✅ CORRECCIÓN: La función cierra correctamente