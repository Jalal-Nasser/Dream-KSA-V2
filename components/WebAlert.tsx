// components/WebAlert.tsx - Web-compatible alert component
import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

interface WebAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export const WebAlert: React.FC<WebAlertProps> = ({ message, onDismiss }) => {
  if (!message || Platform.OS !== 'web') return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={styles.alertContainer}>
        <Text style={styles.alertText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    maxWidth: '90%',
  },
  alertText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Helvetica',
      android: 'Roboto',
      web: 'system-ui',
    }),
  },
});

export default WebAlert;
