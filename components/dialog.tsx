import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';

const Dialog = ({ children, open, onOpenChange, ...props }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog} {...props}>
          {children}
          <Pressable style={styles.closeButton} onPress={() => onOpenChange(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export function DialogHeader({ children, ...props }) {
  return <View style={styles.header} {...props}>{children}</View>;
}

export function DialogTitle({ children, ...props }) {
  return <Text style={styles.title} {...props}>{children}</Text>;
}

export function DialogDescription({ children, ...props }) {
  return <Text style={styles.description} {...props}>{children}</Text>;
}

export function DialogContent({ children, ...props }) {
  return <View style={styles.content} {...props}>{children}</View>;
}

export function DialogFooter({ children, ...props }) {
  return <View style={styles.footer} {...props}>{children}</View>;
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
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#e5e7eb',
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
    // Add content-specific styles here
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});

export default Dialog;