import Constants from 'expo-constants';

// try all known places Expo provides `extra`
const extra =
  (Constants?.expoConfig as any)?.extra ??
  (Constants as any)?.manifest?.extra ??
  (Constants as any).__unsafeNoWarnManifest?.extra ?? // older Expo fallback
  {};

const fromEnv = (k: string) => {
  // Build-time vars (process.env) AND runtime (extra)
  // On device, process.env is usually empty; extra is the source of truth.
  const nodeEnv = (typeof process !== 'undefined' && (process as any).env?.[k]) || undefined;
  return nodeEnv ?? extra?.[k];
};

export const SUPABASE_URL  = fromEnv('EXPO_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON = fromEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// One-time diagnostic to console (won't crash)
const urlShown = (SUPABASE_URL || '').slice(0, 40);
const anonLen = (SUPABASE_ANON || '').length;
if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn('[env] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}
console.log('[env] resolved SUPABASE_URL:', urlShown, '...  ANON len:', anonLen);