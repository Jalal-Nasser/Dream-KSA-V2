import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

export default function Switch({ checked, onCheckedChange, ...props }) {
  const translateX = useSharedValue(checked ? 20 : 0);

  React.useEffect(() => {
    translateX.value = withTiming(checked ? 20 : 0, { duration: 250 });
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(checked ? 20 : 0) }],
    };
  });

  return (
    <Pressable style={[styles.container, checked && styles.containerChecked]} onPress={() => onCheckedChange(!checked)} {...props}>
      <Animated.View style={[styles.thumb, animatedStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    backgroundColor: '#4b5563',
    justifyContent: 'center',
  },
  containerChecked: {
    backgroundColor: '#3b82f6',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});