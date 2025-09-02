import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { getSupabase } from '../supabase';

export async function completeSessionFromParams(params: Record<string, any> | null | undefined) {
  const supabase = getSupabase();
  const access_token = typeof params?.access_token === 'string' ? params?.access_token : '';
  const refresh_token = typeof params?.refresh_token === 'string' ? params?.refresh_token : '';
  const code = typeof params?.code === 'string' ? params?.code : '';

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    return { data, error };
  }
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    return { data, error };
  }
  return { error: new Error('No tokens or code in params') };
}

export async function completeSessionFromRedirect(url?: string) {
  if (!url) return { error: new Error('No redirect URL') };
  console.log('[auth] Processing redirect URL:', url.slice(0, 80));
  const parsed = QueryParams.getQueryParams(url);
  const params = parsed?.params ?? {};
  console.log('[auth] Parsed params:', params);
  return completeSessionFromParams(params);
}
