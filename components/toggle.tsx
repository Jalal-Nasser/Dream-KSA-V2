import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';

export default function Toggle({ children, pressed, onPress, variant = 'default', size = 'default', ...props }) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    pressed && styles.pressed,
  ];

  return (
    <Pressable style={buttonStyles} onPress={onPress} {...props}>
      {typeof children === 'string' ? (
        <Text style={[styles.text, styles[`text_${size}`]]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  // Variants
  default: {
    backgroundColor: '#1f2937',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#4b5563',
  },
  // Sizes
  default: {
    height: 40,
    paddingHorizontal: 12,
  },
  sm: {
    height: 36,
    paddingHorizontal: 8,
  },
  lg: {
    height: 44,
    paddingHorizontal: 16,
  },
  // Pressed state
  pressed: {
    backgroundColor: '#4b5563',
  },
  // Text
  text: {
    color: '#e5e7eb',
  },
  text_sm: {
    fontSize: 14,
  },
  text_default: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
});