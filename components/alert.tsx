import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react-native';

const iconMap = {
  default: Info,
  success: CheckCircle,
  destructive: AlertTriangle,
};

export default function Alert({ children, variant = 'default', ...props }) {
  const IconComponent = iconMap[variant];

  return (
    <View style={[styles.container, styles[`container_${variant}`]]} {...props}>
      <View style={styles.content}>
        {IconComponent && (
          <IconComponent
            size={20}
            color={styles[`text_${variant}`].color}
            style={styles.icon}
          />
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 16,
  },
  // Variants
  container_default: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  text_default: {
    color: '#e5e7eb',
  },
  container_success: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  text_success: {
    color: '#10b981',
  },
  container_destructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  text_destructive: {
    color: '#ef4444',
  },
});