import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react-native';

const iconMap = {
  info: Info,
  success: CheckCircle,
  error: AlertTriangle,
};

const Toast = ({ id, message, type, onDismiss }) => {
  const IconComponent = iconMap[type];
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-50, { duration: 300 }, onDismiss);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.toast, styles[`toast_${type}`], animatedStyle]}>
      {IconComponent && (
        <IconComponent
          size={24}
          color={styles[`text_${type}`].color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, styles[`text_${type}`]]}>{message}</Text>
      <Pressable onPress={onDismiss} style={styles.closeButton}>
        <X size={16} color={styles[`text_${type}`].color} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  toast_info: {
    backgroundColor: '#374151',
  },
  text_info: {
    color: '#e5e7eb',
  },
  toast_success: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  text_success: {
    color: '#10b981',
  },
  toast_error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  text_error: {
    color: '#ef4444',
  },
  icon: {
    marginLeft: 16,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
});

export default function Sonner() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </View>
  );
}

Sonner.add = (message, type) => {
  // You would need to use a context or a global state manager
  // to make this function work globally.
  // For now, this is a placeholder.
};

const sonnerStyles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});