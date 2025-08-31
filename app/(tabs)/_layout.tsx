import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

let CustomTabBar: any = undefined;
try {
  // Adjust path if your component lives elsewhere
  CustomTabBar = require('../../components/BinmoTabBar').default;
  if (!CustomTabBar) { throw new Error('BinmoTabBar has no default export'); }
  // eslint-disable-next-line no-console
  console.log('[tabs/_layout] CustomTabBar loaded');
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[tabs/_layout] CustomTabBar failed, using default tab bar.', e?.message || e);
  CustomTabBar = undefined;
}

export default function TabLayout() {
  // eslint-disable-next-line no-console
  console.log('[tabs/_layout] mounted');
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{ headerShown: false }}
      tabBar={CustomTabBar ? ((props) => <CustomTabBar {...props} />) : undefined}
    >
      <Tabs.Screen name="index" options={{ title: 'استكشف' }} />
      <Tabs.Screen name="live" options={{ title: 'مباشر' }} />
      <Tabs.Screen name="agencies" options={{ title: 'وكالات' }} />
      <Tabs.Screen name="me" options={{ title: 'أنا' }} />
    </Tabs>
  );
}
