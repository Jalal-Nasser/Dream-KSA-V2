import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: true, storage: AsyncStorage, autoRefreshToken: true, detectSessionInUrl: false },
});

// TODO: Remove before release - DEBUG ONLY
export async function getSessionToken(): Promise<string | null> {
  if (!__DEV__) return null;
  try {
    const { data: session } = await supabase.auth.getSession();
    return session?.session?.access_token || null;
  } catch (e) {
    console.log('[auth] getSessionToken error:', e);
    return null;
  }
}

export function getSupabase(){ return supabase }
export { supabase };
export default supabase;