import React from 'react';
import { StyleSheet, View, Modal, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const Sheet = ({ children, open, onOpenChange, ...props }) => {
  const translateY = useSharedValue(open ? 0 : height);

  React.useEffect(() => {
    translateY.value = withTiming(open ? 0 : height, { duration: 300 });
  }, [open]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable style={styles.overlay} onPress={() => onOpenChange(false)}>
        <Animated.View style={[styles.sheet, animatedStyle]} {...props}>
          <Pressable onPress={() => { /* Do nothing to prevent closing on press */ }}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export function SheetHeader({ children, ...props }) {
  return <View style={styles.header} {...props}>{children}</View>;
}

export function SheetTitle({ children, ...props }) {
  return <Text style={styles.title} {...props}>{children}</Text>;
}

export function SheetDescription({ children, ...props }) {
  return <Text style={styles.description} {...props}>{children}</Text>;
}

export function SheetContent({ children, ...props }) {
  return <View style={styles.content} {...props}>{children}</View>;
}

export function SheetFooter({ children, ...props }) {
  return <View style={styles.footer} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#1f2937',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#9ca3af',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 16,
  },
});

export default Sheet;