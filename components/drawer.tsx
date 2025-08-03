import React from 'react';
import { StyleSheet, View, Modal, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Drawer = ({ children, open, onOpenChange, ...props }) => {
  const translateX = useSharedValue(open ? 0 : width);

  React.useEffect(() => {
    translateX.value = withTiming(open ? 0 : width, { duration: 300 });
  }, [open]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
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
        <Animated.View style={[styles.drawer, animatedStyle]} {...props}>
          <Pressable onPress={() => { /* Do nothing to prevent closing on press */ }}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export function DrawerHeader({ children, ...props }) {
  return <View style={styles.header} {...props}>{children}</View>;
}

export function DrawerTitle({ children, ...props }) {
  return <Text style={styles.title} {...props}>{children}</Text>;
}

export function DrawerDescription({ children, ...props }) {
  return <Text style={styles.description} {...props}>{children}</Text>;
}

export function DrawerContent({ children, ...props }) {
  return <View style={styles.content} {...props}>{children}</View>;
}

export function DrawerFooter({ children, ...props }) {
  return <View style={styles.footer} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#1f2937',
    padding: 16,
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

export default Drawer;