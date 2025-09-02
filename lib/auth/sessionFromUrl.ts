import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { getSupabase } from '../supabase';

export async function completeSessionFromRedirect(url?: string) {
  if (!url) return { error: new Error('No redirect URL') };

  console.log('[auth] Processing redirect URL:', url);
  
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    console.warn('[auth] QueryParams error:', errorCode);
    return { error: new Error(String(errorCode)) };
  }

  console.log('[auth] Parsed params:', params);

  const supabase = getSupabase();

  // Implicit flow: tokens in URL fragment (#access_token & #refresh_token)
  const access_token = typeof params?.access_token === 'string' ? params.access_token : '';
  const refresh_token = typeof params?.refresh_token === 'string' ? params.refresh_token : '';
  if (access_token && refresh_token) {
    console.log('[auth] Found tokens, setting session');
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    return { data, error };
  }

  // PKCE flow: code in query string (?code=...)
  const code = typeof params?.code === 'string' ? params.code : '';
  if (code) {
    console.log('[auth] Found code, exchanging for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    return { data, error };
  }

  console.warn('[auth] No tokens or code found in URL');
  return { error: new Error('No tokens or code in redirect URL') };
}
