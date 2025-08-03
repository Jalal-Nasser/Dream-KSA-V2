import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';

export default function Avatar({ src, fallback, ...props }) {
  const hasImage = !!src;
  
  return (
    <View style={styles.container} {...props}>
      {hasImage ? (
        <Image source={{ uri: src }} style={styles.image} />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{fallback}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#e5e7eb',
    fontSize: 24,
    fontWeight: 'bold',
  },
});