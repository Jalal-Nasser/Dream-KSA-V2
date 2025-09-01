import Constants from 'expo-constants';

const extra = (Constants.expoConfig || (Constants as any).manifest)?.extra || {};
const fromEnv = (k: string) => (typeof process !== 'undefined' && (process as any).env?.[k]) || extra?.[k];

export const SUPABASE_URL  = fromEnv('EXPO_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON = fromEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn('[env] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Put real values in .env and restart with cache clear.');
}