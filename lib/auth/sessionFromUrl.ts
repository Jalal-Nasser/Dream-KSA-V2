import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { getSupabase } from '../supabase';

export async function completeSessionFromRedirect(url?: string) {
  if (!url) return { error: new Error('No redirect URL') };

  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) return { error: new Error(String(errorCode)) };

  const supabase = getSupabase();

  // Implicit flow: tokens in URL fragment (#access_token & #refresh_token)
  const access_token = typeof params?.access_token === 'string' ? params.access_token : '';
  const refresh_token = typeof params?.refresh_token === 'string' ? params.refresh_token : '';
  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    return { data, error };
  }

  // PKCE flow: code in query string (?code=...)
  const code = typeof params?.code === 'string' ? params.code : '';
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
    return { data, error };
  }

  return { error: new Error('No tokens or code in redirect URL') };
}
