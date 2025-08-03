import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';

export default function Menubar({ children, ...props }) {
  return (
    <View style={styles.menubar} {...props}>
      {children}
    </View>
  );
}

export function MenubarMenu({ children, ...props }) {
  const [modalVisible, setModalVisible] = useState(false);
  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);
  const content = React.Children.toArray(children).find((child) => child.props.isContent);

  return (
    <View>
      <Pressable onPress={() => setModalVisible(true)}>
        {trigger}
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menuContent}>
            {React.Children.map(content, (child) => React.cloneElement(child))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export function MenubarTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function MenubarContent({ children, ...props }) {
  return React.cloneElement(children, { isContent: true, ...props });
}

export function MenubarItem({ children, onSelect, ...props }) {
  return (
    <Pressable style={styles.item} onPress={onSelect} {...props}>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menubar: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1f2937',
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
});