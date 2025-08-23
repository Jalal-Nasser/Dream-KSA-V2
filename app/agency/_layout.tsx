import React from 'react';
import { Stack } from 'expo-router';
import { I18nManager } from 'react-native';
import { useEffect } from 'react';

export default function Layout() {
  useEffect(() => {
    // Ensure RTL layout at runtime (no app reload required for text/layout in most cases)
    if (!I18nManager.isRTL) {
      try { I18nManager.allowRTL(true); I18nManager.forceRTL(true); } catch {}
    }
  }, []);
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'الوكالات' }} />
      <Stack.Screen name="owner" options={{ title: 'لوحة وكالة' }} />
      <Stack.Screen name="host" options={{ title: 'لوحة المضيف' }} />
    </Stack>
  );
}
