import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function Input({ ...props }) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#374151',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    fontSize: 16,
  },
});