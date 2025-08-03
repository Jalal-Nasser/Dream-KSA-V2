import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Badge({ children, variant = 'default', ...props }) {
  const badgeStyles = [styles.base, styles[variant]];
  const textStyles = [styles.text, styles[`text_${variant}`]];

  return (
    <View style={badgeStyles} {...props}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
  },
  // Variants
  default: {
    backgroundColor: '#374151',
  },
  text_default: {
    color: '#e5e7eb',
  },
  secondary: {
    backgroundColor: '#1f2937',
  },
  text_secondary: {
    color: '#9ca3af',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  text_destructive: {
    color: 'white',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#4b5563',
    borderWidth: 1,
  },
  text_outline: {
    color: '#e5e7eb',
  },
});