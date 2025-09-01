import Constants from 'expo-constants';

const extra = (Constants.expoConfig || (Constants as any).manifest)?.extra || {};

export const SUPABASE_URL = extra?.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON = extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn('[env] Missing EXPO_PUBLIC_SUPABASE_* in app.json -> expo.extra');
}


