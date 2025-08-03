import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewProps, Easing } from 'react-native';

interface SkeletonProps extends ViewProps {
  className?: string; // Note: className is not used in React Native
}

const Skeleton = ({ style, ...props }: SkeletonProps) => {
  const opacityValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacityValue]);

  return (
    <Animated.View
      style={[styles.skeleton, { opacity: opacityValue }, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB', // Equivalent to a light gray 'accent' color
    borderRadius: 8,
  },
});

export { Skeleton };