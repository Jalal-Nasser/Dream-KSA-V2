import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 14,
          height: 64,
          borderRadius: 20,
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        },
        tabBarActiveTintColor: '#00C853',
        tabBarInactiveTintColor: '#7A7A7A',
        tabBarLabelStyle: { fontSize: 12, marginBottom: 2, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const name = route.name;
          if (name === 'index') return <Ionicons name="home" color={color} size={20} />;
          if (name === 'live') return <Ionicons name="radio" color={color} size={20} />;
          if (name === 'agencies') return <MaterialIcons name="groups" color={color} size={20} />;
          if (name === 'me' || name === 'profile') return <Ionicons name="person" color={color} size={20} />;
          return null;
        },
      })}
    />
  );
}

