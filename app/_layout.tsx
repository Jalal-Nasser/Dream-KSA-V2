// app/_layout.tsx
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';

export default function Layout() {
  useEffect(() => {
    // Force RTL for Arabic support
    if (Platform.OS !== 'web') {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(false); // Keep false to allow mixed content
    }
  }, []);

  return <Slot />;
}
