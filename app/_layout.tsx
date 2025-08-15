import 'react-native-get-random-values';
import 'expo-standard-web-crypto';

import { Stack, Redirect, Slot, useRouter, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert, View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function AuthGate({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setHasSession(!!session);
      } catch (error) {
        console.error('Session check error:', error);
        setHasSession(false);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setHasSession(!!session);
        setIsLoading(false);
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Handle deep link OAuth code exchange
  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      const { queryParams } = Linking.parse(url);
      const code = (queryParams?.code as string) || undefined;
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          Alert.alert('Login failed', error.message);
        } else {
          router.replace('/join');
        }
      }
    });
    return () => sub.remove();
  }, [router]);

  // Handle navigation based on auth state and current path
  useEffect(() => {
    if (isLoading) return;

    if (!hasSession) {
      // No session - allow access to login and verify screens
      if (pathname !== '/login' && pathname !== '/verify') {
        router.replace('/login');
      }
    } else {
      // Has session - handle navigation
      if (pathname === '/' || pathname === '/login') {
        router.replace('/join');
      }
    }
  }, [hasSession, isLoading, pathname, router]);

  // Always render Slot to prevent white screen
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );
}
