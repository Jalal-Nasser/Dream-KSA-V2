import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

// Minimal root layout for Expo Router — must render a Slot on first render.
export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021' },
});

