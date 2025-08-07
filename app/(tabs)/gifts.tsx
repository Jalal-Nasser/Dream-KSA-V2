import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GiftsScreen() {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#101828' }]}>  {/* Match login screen color */}
      <Text style={styles.text}>الهدايا</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
