import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/lib/ThemeProvider';
import TabBar from '@/src/components/TabBar';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandGradient } from '@/lib/theme';

export default function Layout() {
  const t = useTheme();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerBackground: () => (
          <LinearGradient colors={BrandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        ),
        headerTitleStyle: { color: 'white', fontWeight: '800' },
        headerTintColor: 'white',
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home"    options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="rooms"   options={{ title: 'Rooms' }} />
      <Tabs.Screen name="agency"  options={{ title: 'Agencies' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}