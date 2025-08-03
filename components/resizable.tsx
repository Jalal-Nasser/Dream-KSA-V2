import React, { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { GripVertical } from 'lucide-react-native';

const Resizable = ({ children, initialWidth = 200, minWidth = 100, maxWidth = 400, ...props }) => {
  const width = useSharedValue(initialWidth);
  const startWidth = useSharedValue(initialWidth);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startWidth.value = width.value;
    })
    .onUpdate((event) => {
      width.value = Math.min(maxWidth, Math.max(minWidth, startWidth.value + event.translationX));
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
    };
  });

  return (
    <View style={styles.container} {...props}>
      <Animated.View style={[styles.resizable, animatedStyle]}>
        {children}
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <View style={styles.handle}>
          <GripVertical size={20} color="#e5e7eb" />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  resizable: {
    // Add any base styles for the resizable content
  },
  handle: {
    width: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
});

export default Resizable;