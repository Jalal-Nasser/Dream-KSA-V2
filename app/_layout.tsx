import { Slot } from 'expo-router';
import * as React from 'react';
import * as Linking from 'expo-linking';
import { completeSessionFromRedirect } from '../lib/auth/sessionFromUrl';

function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  // Accept expo proxy returns, scheme returns, or anything with tokens/code
  return url.includes('auth.expo.io') ||
         url.includes('access_token') ||
         url.includes('refresh_token') ||
         url.includes('code=') ||
         url.includes('/--/auth-callback') ||
         url.includes('auth-callback');
}

export default function RootLayout() {
  React.useEffect(() => {
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial && looksLikeAuthReturn(initial)) {
        const { error } = await completeSessionFromRedirect(initial);
        if (error) console.warn('[auth initialURL]', error.message);
      }
    })();

    const sub = Linking.addEventListener('url', async ({ url }) => {
      if (!looksLikeAuthReturn(url)) return;
      const { error } = await completeSessionFromRedirect(url);
      if (error) console.warn('[auth listener]', error.message);
    });
    return () => sub.remove();
  }, []);

  return <Slot />;
}

