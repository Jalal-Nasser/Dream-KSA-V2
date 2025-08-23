import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export function getRedirectUri() {
  // Always resolves to dream-ksa://auth/callback for native/dev client
  // (and still works under Expo Go via the proxy)
  return Linking.createURL('auth/callback', { scheme: 'dream-ksa' });
}

async function handleAuthUrl(url: string) {
  try {
    // HASH FLOW (implicit)
    if (url.includes('#')) {
      const hash = url.split('#')[1] || '';
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token') || '';
      const refresh_token = params.get('refresh_token') || '';
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        console.log('[AUTH] setSession (hash)', { hasSession: !!data?.session, error });
        if (!error && data?.session) router.replace('/rooms');
        return;
      }
    }

    // CODE FLOW (PKCE)
    const { queryParams } = Linking.parse(url);
    const code = (queryParams?.code as string) || '';
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
      console.log('[AUTH] exchangeCodeForSession', { hasSession: !!data?.session, error });
      if (!error && data?.session) router.replace('/rooms');
    }
  } catch (e) {
    console.warn('[AUTH] url handler error', e);
  }
}

export function useSupabaseAuthListener() {
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('[AUTH] got url', url);
      handleAuthUrl(url);
    });
    return () => sub.remove();
  }, []);
}
