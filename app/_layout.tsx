import { Slot } from 'expo-router';
import * as React from 'react';
import * as Linking from 'expo-linking';
import { getSupabase } from '../lib/supabase';

export default function RootLayout() {
  React.useEffect(() => {
    const supabase = getSupabase();

    (async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const { queryParams, path } = Linking.parse(url);
        if (path?.endsWith('auth-callback') && typeof queryParams?.code === 'string') {
          await supabase.auth.exchangeCodeForSession({ code: String(queryParams.code) }).catch(e => console.warn('[auth initialURL]', e?.message));
        }
      }
    })();

    const sub = Linking.addEventListener('url', async ({ url }) => {
      const { queryParams, path } = Linking.parse(url);
              if (path?.endsWith('auth-callback') && typeof queryParams?.code === 'string') {
          await supabase.auth.exchangeCodeForSession({ code: String(queryParams.code) }).catch(e => console.warn('[auth listener]', e?.message));
        }
    });
    return () => sub.remove();
  }, []);

  return <Slot />;
}

