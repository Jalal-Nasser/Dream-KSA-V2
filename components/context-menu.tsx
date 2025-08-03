import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Modal } from 'react-native';

const ContextMenu = ({ children, onOpen, ...props }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleLongPress = (event) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setModalVisible(true);
    onOpen && onOpen(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    onOpen && onOpen(false);
  };

  const content = React.Children.toArray(children).find((child) => child.props.isContent);
  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);

  return (
    <View {...props}>
      <Pressable onLongPress={handleLongPress}>
        {trigger}
      </Pressable>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={[styles.menu, { top: menuPosition.y, left: menuPosition.x }]}>
            {React.Children.map(content, (child) => React.cloneElement(child))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export function ContextMenuTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function ContextMenuContent({ children, ...props }) {
  return <View style={styles.content} {...props}>{children}</View>;
}

export function ContextMenuItem({ children, onSelect, ...props }) {
  return (
    <Pressable style={styles.item} onPress={onSelect} {...props}>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    overflow: 'hidden',
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