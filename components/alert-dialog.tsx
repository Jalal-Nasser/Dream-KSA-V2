import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

export default function AlertDialog({ children, open, onOpenChange, ...props }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function AlertDialogTitle({ children, ...props }) {
  return <Text style={styles.title} {...props}>{children}</Text>;
}

export function AlertDialogDescription({ children, ...props }) {
  return <Text style={styles.description} {...props}>{children}</Text>;
}

export function AlertDialogHeader({ children, ...props }) {
  return <View style={styles.header} {...props}>{children}</View>;
}

export function AlertDialogFooter({ children, ...props }) {
  return <View style={styles.footer} {...props}>{children}</View>;
}

export function AlertDialogAction({ children, ...props }) {
  return <Pressable style={styles.actionButton} {...props}>{children}</Pressable>;
}

export function AlertDialogCancel({ children, ...props }) {
  return <Pressable style={styles.cancelButton} {...props}>{children}</Pressable>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '90%',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#4b5563',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});