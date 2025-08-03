import React, { useState } from 'react';
import { StyleSheet, View, Modal, Pressable } from 'react-native';

const Popover = ({ children, open, onOpenChange, ...props }) => {
  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);
  const content = React.Children.toArray(children).find((child) => child.props.isContent);

  return (
    <View {...props}>
      <Pressable onPress={() => onOpenChange(!open)}>
        {trigger}
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={open}
        onRequestClose={() => onOpenChange(false)}
      >
        <Pressable style={styles.overlay} onPress={() => onOpenChange(false)}>
          <View style={styles.popover}>
            {content}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export function PopoverTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function PopoverContent({ children, ...props }) {
  return React.cloneElement(children, { isContent: true, ...props });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popover: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Popover;