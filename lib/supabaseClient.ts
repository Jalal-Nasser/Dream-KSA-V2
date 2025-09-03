import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './env';

if (!SUPABASE_URL || !SUPABASE_ANON) {
  // Fail loudly in dev to catch misconfig early
  console.warn('[supabaseClient] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_ANON) throw new Error('[supabase] Missing URL/ANON key.');
    if (typeof SUPABASE_URL === 'string' && !SUPABASE_URL.includes('.supabase.co')) {
      console.warn('[supabase] WARNING: SUPABASE_URL does not look like a Supabase domain:', SUPABASE_URL);
    }
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return client;
}

// Create a single, shared client; do NOT import from other app files here to avoid cycles.
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type { SupabaseClient };
