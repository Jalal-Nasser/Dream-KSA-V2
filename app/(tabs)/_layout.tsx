import React from 'react';
import { Tabs } from 'expo-router';
import BinmoTabBar from '../components/BinmoTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // hide default
      }}
      tabBar={(props) => <BinmoTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'استكشف' }} />
      <Tabs.Screen name="live" options={{ title: 'مباشر' }} />
      <Tabs.Screen name="agencies" options={{ title: 'وكالات' }} />
      <Tabs.Screen name="me" options={{ title: 'أنا' }} />
    </Tabs>
  );
}
