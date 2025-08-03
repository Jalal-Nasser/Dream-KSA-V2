import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Card({ children, ...props }) {
  return <View style={styles.card} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});