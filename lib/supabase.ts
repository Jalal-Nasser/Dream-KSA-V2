import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './env';

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      throw new Error('[supabase] Missing URL/ANON key. Set EXPO_PUBLIC_SUPABASE_* in .env and restart (npx expo start -c).');
    }
    client = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 5 } }
    });
  }
  return client;
}