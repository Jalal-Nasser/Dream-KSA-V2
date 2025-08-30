import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Live() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>الغرف المباشرة</Text>
        <Text style={styles.sub}>سنربطها لاحقاً ببيانات Supabase/100ms</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 6 },
});
