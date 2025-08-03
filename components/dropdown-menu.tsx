import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Modal } from 'react-native';

const DropdownMenu = ({ children, ...props }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);
  const content = React.Children.toArray(children).find((child) => child.props.isContent);

  return (
    <View {...props}>
      <Pressable onPress={() => setModalVisible(true)}>
        {trigger}
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menu}>
            {React.Children.map(content, (child) => React.cloneElement(child))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export function DropdownMenuTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function DropdownMenuContent({ children, ...props }) {
  return <View style={styles.content} {...props}>{children}</View>;
}

export function DropdownMenuItem({ children, onSelect, ...props }) {
  return (
    <Pressable style={styles.item} onPress={onSelect} {...props}>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    paddingVertical: 8,
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

export default DropdownMenu;