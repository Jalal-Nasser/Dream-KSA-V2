import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Button({ children, variant = 'default', size = 'default', ...props }) {
  const buttonStyles = [styles.base, styles[variant], styles[size]];

  const gradientColors = (variant) => {
    switch (variant) {
      case 'dream':
        return ['#8b5cf6', '#ec4899'];
      case 'secondary':
        return ['#374151', '#4b5563'];
      case 'destructive':
        return ['#ef4444', '#f87171'];
      default:
        return ['#1f2937', '#374151'];
    }
  };

  const hasGradient = variant === 'dream' || variant === 'secondary' || variant === 'destructive' || variant === 'default';

  return (
    <Pressable style={buttonStyles} {...props}>
      {hasGradient ? (
        <LinearGradient
          colors={gradientColors(variant)}
          style={styles.gradient}
        >
          {typeof children === 'string' ? (
            <Text style={[styles.text, styles[`text_${variant}`]]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </LinearGradient>
      ) : (
        typeof children === 'string' ? (
          <Text style={[styles.text, styles[`text_${variant}`]]}>
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Variants
  default: {
    backgroundColor: '#1f2937',
  },
  dream: {
    // This will be handled by the LinearGradient
  },
  destructive: {
    // This will be handled by the LinearGradient
  },
  secondary: {
    // This will be handled by the LinearGradient
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  // Sizes
  default: {
    height: 44,
    paddingHorizontal: 16,
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  lg: {
    height: 52,
    paddingHorizontal: 24,
  },
  icon: {
    height: 40,
    width: 40,
  },
  // Text styles
  text: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text_destructive: {
    color: 'white',
  },
  text_secondary: {
    color: 'white',
  },
  text_ghost: {
    color: '#e5e7eb',
  },
  text_link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  text_dream: {
    color: 'white',
  },
});