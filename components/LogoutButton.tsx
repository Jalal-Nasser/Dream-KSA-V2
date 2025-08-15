import React from 'react';
import { Pressable, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function LogoutButton() {
  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };
  
  return (
    <Pressable onPress={onLogout} style={{ padding: 8 }}>
      <Text style={{ color: '#d00' }}>تسجيل الخروج</Text>
    </Pressable>
  );
}
