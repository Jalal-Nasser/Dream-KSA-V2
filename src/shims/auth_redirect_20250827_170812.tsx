// app/auth/redirect.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { handleAuthRedirect } from '@/lib/auth';
import { supabase } from '@/supabase';

export default function AuthRedirect() {
  const [status, setStatus] = useState<'working'|'done'|'error'>('working');
  const [message, setMessage] = useState<string>('Finalizing sign-in…');

  useEffect(() => {
    let sub: { remove: () => void } | undefined;

    const process = async () => {
      try {
        // Handle warm start deep link
        const initial = await Linking.getInitialURL();
        const url = initial ?? (await new Promise<string>((resolve, reject) => {
          sub = Linking.addEventListener('url', ({ url }) => resolve(url));
          // Fallback timeout if event never fires
          setTimeout(() => reject(new Error("No redirect URL received.")), 2000);
        }).catch(() => ''));
        
        if (!url) throw new Error("Missing redirect URL");

        await handleAuthRedirect(url);

        setStatus('done');
        setMessage('Signed in. Redirecting…');

        // Optional sanity check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Session not found after redirect.");

        router.replace('/explore');
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message ?? 'Auth failed.');
      } finally {
        sub?.remove?.();
      }
    };

    process();
  }, []);

  return (
    <View style={{ flex: 1, alignItems:'center', justifyContent:'center', padding: 24 }}>
      {status === 'working' && <ActivityIndicator />}
      <Text style={{ marginTop: 16, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
