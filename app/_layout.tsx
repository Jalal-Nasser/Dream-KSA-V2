// Polyfills MUST load before any Supabase or network code runs.
import '@/lib/polyfills';
import { Slot } from 'expo-router';
import { LogBox, View, StyleSheet } from 'react-native';
import React from 'react';
import * as Linking from 'expo-linking';
import { looksLikeAuthReturn } from '@/lib/linking';
import { completeSessionFromRedirect } from '@/lib/auth/sessionFromUrl';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBackendBase } from '@/lib/api';
import { NativeModules, Platform } from "react-native";
import { Audio } from 'expo-av';
// Demo Mode: install fetch shim early (no-op when disabled)
import './lib/demoFetch';
// TODO: Remove before release - DEBUG ONLY
import { getSessionToken } from '@/lib/supabase';

// Runtime override for backend URL (no rebuild needed)
(globalThis as any).__BACKEND_URL = "https://api.dreamsksa.online";

// Boot log - confirm backend URL at runtime
try {
  console.log("[boot] backend base:", getBackendBase());
} catch (e: any) {
  console.log("[boot] backend base error:", e?.message);
}

// HMS diagnostic
try {
  const hasHMS = !!(NativeModules as any)?.HMSManager;
  console.log("[hms] native module present:", Platform.OS, hasHMS);
} catch {}

// TODO: Remove before release - DEBUG ONLY
if (__DEV__) {
  // Log token at app start (dev only)
  setTimeout(async () => {
    try {
      const token = await getSessionToken();
      console.log('[auth] token (dev)', token ? token.slice(0, 24) + '…' : 'none');
    } catch (e) {
      console.log('[auth] token (dev) error:', e);
    }
  }, 1000); // Delay to ensure auth is initialized
}

/**
 * SafeLayout
 * - ensures the whole app respects the top safe area inset (status bar / notch)
 * - uses paddingTop = insets.top so header and content won't be under the system status icons
 */
function SafeLayout({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.safeContainer, { paddingTop: insets.top }]}>{children}</View>;
}

export default function RootLayout() {
  // Silence flaky Metro websocket noise during OAuth/app switching
  LogBox.ignoreLogs([
    'Cannot connect to Metro',
    'Software caused connection abort',
  ]);
  
  // Configure audio session for iOS to prevent silent joins
  React.useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: 1, // duck others
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.log('[audio] setAudioMode failed', e);
      }
    })();
  }, []);
  
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
  
  return (
    <SafeAreaProvider>
      <SafeLayout>
        <Slot />
      </SafeLayout>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff", // keep existing background - change if your app uses a different bg
  },
});
