import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { getSupabase } from '../supabase';

export async function completeSessionFromRedirect(url?: string) {
  if (!url) return { error: new Error('No redirect URL') };
  console.log('[auth] Processing redirect URL:', url.slice(0, 80));
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) return { error: new Error(String(errorCode)) };

  const supabase = getSupabase();

  const access_token = typeof params?.access_token === 'string' ? params.access_token : '';
  const refresh_token = typeof params?.refresh_token === 'string' ? params.refresh_token : '';
  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return { error };
    return { data };
  }

  const code = typeof params?.code === 'string' ? params.code : '';
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
    if (error) return { error };
    return { data };
  }

  return { error: new Error('No tokens or code in redirect URL') };
}