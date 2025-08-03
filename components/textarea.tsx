import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function Textarea({ ...props }) {
  return (
    <TextInput
      style={styles.textarea}
      placeholderTextColor="#9ca3af"
      multiline
      numberOfLines={4}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    backgroundColor: '#374151',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    fontSize: 16,
    textAlignVertical: 'top',
  },
});