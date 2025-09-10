import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: true, storage: AsyncStorage, autoRefreshToken: true, detectSessionInUrl: false },
});
export function getSupabase(){ return supabase }
export { supabase };
export default supabase;