// Polyfills MUST load before any Supabase or network code runs.
import '@/lib/polyfills';
import { Slot } from 'expo-router';
import { LogBox } from 'react-native';
import * as React from 'react';
import * as Linking from 'expo-linking';
import { looksLikeAuthReturn } from '../lib/linking';
import { completeSessionFromRedirect } from '../lib/auth/sessionFromUrl';

export default function RootLayout() {
  // Silence flaky Metro websocket noise during OAuth/app switching
  LogBox.ignoreLogs([
    'Cannot connect to Metro',
    'Software caused connection abort',
  ]);
  React.useEffect(() => {
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial && looksLikeAuthReturn(initial)) {
        const { error } = await completeSessionFromRedirect(initial);
        if (error) console.warn('[auth initialURL]', error.message);
      }
    })();
    const sub = Linking.addEventListener('url', async ({ url }) => {
      if (url && looksLikeAuthReturn(url)) {
        const { error } = await completeSessionFromRedirect(url);
        if (error) console.warn('[auth listener]', error.message);
      }
    });
    return () => sub.remove();
  }, []);
  return <Slot />;
}