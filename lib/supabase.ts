import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './env';

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