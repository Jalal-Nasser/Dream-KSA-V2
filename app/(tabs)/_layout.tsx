import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Search, Mic, Gift, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2f1e3bff',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'ميكس',
          tabBarIcon: ({ color, size }) => (
            <Mic color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="gifts"
        options={{
          title: 'الهدايا',
          tabBarIcon: ({ color, size }) => (
            <Gift color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}