import { Slot } from 'expo-router';
import * as React from 'react';
import * as Linking from 'expo-linking';
import { getSupabase } from '../lib/supabase';

export default function RootLayout() {
  React.useEffect(() => {
    const supabase = getSupabase();
    const sub = Linking.addEventListener('url', async ({ url }) => {
      const { queryParams, path } = Linking.parse(url);
      if (path?.endsWith('auth-callback') && typeof queryParams?.code === 'string') {
        const { error } = await supabase.auth.exchangeCodeForSession({ code: String(queryParams.code) });
        if (error) console.warn('[exchangeCodeForSession]', error.message);
      }
    });
    return () => sub.remove();
  }, []);
  return <Slot />;
}

