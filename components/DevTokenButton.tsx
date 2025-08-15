import React, { useCallback } from 'react';
import { TouchableOpacity, Text, Alert, View, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function DevTokenButton() {
  const onPress = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const token = data.session?.access_token;
      if (!token) {
        Alert.alert('JWT', 'No active session token found.');
        return;
      }
      console.log('JWT:', token);
      Alert.alert('JWT (first 60 chars)', token.slice(0, 60) + '...');
    } catch (e: any) {
      Alert.alert('JWT error', e?.message ?? 'Unknown error');
    }
  }, []);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <TouchableOpacity onPress={onPress} style={styles.btn}>
        <Text style={styles.txt}>JWT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, bottom: 28 },
  btn: {
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    opacity: 0.85,
  },
  txt: { color: '#fff', fontWeight: '600' },
});
