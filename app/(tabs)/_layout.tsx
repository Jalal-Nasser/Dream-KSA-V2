import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.select({ ios: 64, default: 58 }),
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.08,
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      {/* Only declare screens that exist to avoid warnings. Start with index. */}
      <Tabs.Screen name="index" options={{ title: 'index' }} />
      {/* Uncomment when these files exist: */}
      {/* <Tabs.Screen name="live" /> */}
      {/* <Tabs.Screen name="agencies" /> */}
      {/* <Tabs.Screen name="me" /> */}
    </Tabs>
  );
}
