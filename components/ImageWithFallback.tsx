import React, { useState } from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';

const FallbackComponent = () => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackText}>Image Failed to Load</Text>
  </View>
);

const ImageWithFallback = ({ source, fallback, ...props }) => {
  const [hasError, setHasError] = useState(false);

  const Fallback = fallback || FallbackComponent;

  return (
    <View style={styles.container}>
      {hasError ? (
        <Fallback />
      ) : (
        <Image
          source={source}
          onError={() => setHasError(true)}
          style={styles.image}
          {...props}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#e5e7eb',
  },
});

export default ImageWithFallback;