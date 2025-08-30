import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Use file-based routes inside app/(tabs) and only set shared screenOptions here.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0b1020',
          borderTopColor: 'transparent',
          height: 64,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        tabBarIcon: ({ color, size }) => {
          const name = route.name;
          if (name === 'index') return <Ionicons name="planet" color={color} size={size} />;
          if (name === 'live') return <Ionicons name="radio" color={color} size={size} />;
          if (name === 'agencies') return <MaterialIcons name="groups" color={color} size={size} />;
          if (name === 'profile') return <Ionicons name="person-circle" color={color} size={size} />;
          return null;
        },
      })}
    />
  );
}

