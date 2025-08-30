import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../_binmo-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 12, right: 12, bottom: 12,
          height: 64, borderRadius: 20, backgroundColor: '#fff',
          shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: '#7A7A7A',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
        tabBarIcon: ({ color }) => {
          const name = route.name;
          if (name === 'index') return <Ionicons name="home" color={color} size={20} />;
          if (name === 'live') return <Ionicons name="radio" color={color} size={20} />;
          if (name === 'agencies') return <MaterialIcons name="groups" color={color} size={20} />;
          if (name === 'me') return <Ionicons name="person" color={color} size={20} />;
          return null;
        },
      })}
    />
  );
}

