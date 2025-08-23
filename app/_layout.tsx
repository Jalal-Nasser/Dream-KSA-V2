import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { Alert } from 'react-native';
import { redeemInvite } from '@/src/db/invites';

// ensure this is at module top-level exactly once in the app
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      console.log('[AUTH] got url', url);
      const { queryParams } = Linking.parse(url);
      const code = (queryParams?.code as string) || '';
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
        console.log('[AUTH] exchange result', { hasSession: !!data?.session, error });
        if (!error && data?.session) router.replace('/rooms');
      }
    });
    return () => sub.remove();
  }, [router]);

  // Handle invite deep links
  useEffect(() => {
    async function handleInvite(url: string) {
      try {
        const parsed = Linking.parse(url);
        const path = (parsed?.path || "").toLowerCase();
        const code = (parsed?.queryParams?.code || "") as string;
        if (path === "invite" && code) {
          const { data } = await supabase.auth.getSession();
          const hasSession = !!data.session;
          if (!hasSession) {
            Alert.alert("Login required", "Please sign in, then tap the invite link again.");
            return;
          }
          const res = await redeemInvite(code);
          if (res?.agency_id) {
            Alert.alert("Joined", "You are now a member of the agency.");
            router.push(`/agency/${res.agency_id}`);
          } else {
            Alert.alert("Invalid", "Invite is invalid or expired.");
          }
        }
      } catch (e: any) {
        Alert.alert("Invite failed", e?.message || "Unknown error");
      }
    }

    const sub = Linking.addEventListener("url", (e) => handleInvite(e.url));
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) handleInvite(initial);
    })();
    return () => sub.remove();
  }, [router]);

  return (
    <ThemeProvider>
      <PaperProvider theme={MD3DarkTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </ThemeProvider>
  );
}
