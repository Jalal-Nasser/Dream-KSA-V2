import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Agencies() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>الوكالات</Text>
        <Text style={styles.sub}>واجهة مبدئية — سنربطها بجدول agencies لديك</Text>
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
