import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function Label({ children, ...props }) {
  return (
    <Text style={styles.label} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#e5e7eb',
    fontSize: 16,
  },
});