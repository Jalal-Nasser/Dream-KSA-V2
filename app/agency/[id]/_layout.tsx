import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useSetPrimary } from '@/lib/ThemeProvider';
import { supabase } from '@/lib/supabase';

export default function AgencyLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setPrimary = useSetPrimary();
  const [agency, setAgency] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    // Fetch agency to get theme color
    supabase
      .from('agencies')
      .select('theme_color')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.theme_color) {
          setAgency(data);
          setPrimary(data.theme_color);
        }
      });
  }, [id, setPrimary]);

  // Reset theme when leaving this layout
  useEffect(() => {
    return () => {
      setPrimary('#6C5CE7'); // Reset to default
    };
  }, [setPrimary]);

  return (
    <Stack 
      screenOptions={{ 
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: agency?.theme_color || '#6C5CE7',
        },
        headerTitleStyle: { 
          color: 'white', 
          fontWeight: '800' 
        },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Agency Details',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="explore" 
        options={{ 
          title: 'Explore',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="customize" 
        options={{ 
          title: 'Customize',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="roles" 
        options={{ 
          title: 'Roles',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="vip" 
        options={{ 
          title: 'VIP Manager',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}


