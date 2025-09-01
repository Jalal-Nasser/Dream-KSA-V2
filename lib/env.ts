import Constants from 'expo-constants';

const extras =
  (Constants?.expoConfig as any)?.extra ??
  (Constants as any)?.manifest?.extra ??
  (Constants as any).__unsafeNoWarnManifest?.extra ??
  {};

const fromEnv = (k: string) =>
  (typeof process !== 'undefined' && (process as any).env?.[k]) ?? extras?.[k];

export const SUPABASE_URL  = fromEnv('EXPO_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON = fromEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

console.log('[env] resolved SUPABASE_URL prefix:', (SUPABASE_URL || '').slice(0, 32), '…  ANON len:', (SUPABASE_ANON || '').length);
if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn('[env] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}