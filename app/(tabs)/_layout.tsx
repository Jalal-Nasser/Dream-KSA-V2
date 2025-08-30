import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0b1020',
          borderTopColor: 'transparent',
          height: 64,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'استكشاف',
          tabBarIcon: ({ color, size }) => <Ionicons name="planet" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'غرف مباشرة',
          tabBarIcon: ({ color, size }) => <Ionicons name="radio" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="agencies"
        options={{
          title: 'الوكالات',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="groups" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

