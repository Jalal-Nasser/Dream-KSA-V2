import React from 'react';
import { Stack } from 'expo-router';

export default function DevLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#1f2937' },
        headerTitleStyle: { color: 'white', fontWeight: '800' },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen 
        name="qa-featured" 
        options={{ 
          title: 'QA: Featured Rooms',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="qa-agency-rls" 
        options={{ 
          title: 'QA: Agency RLS',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="feature-audit" 
        options={{ 
          title: 'QA: Feature Audit',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="qa-invites" 
        options={{ 
          title: 'QA: Invites',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}
