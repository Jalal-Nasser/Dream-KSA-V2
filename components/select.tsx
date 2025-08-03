import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

const Select = ({ children, value, onValueChange, ...props }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);
  const content = React.Children.toArray(children).find((child) => child.props.isContent);

  const selectedItem = React.Children.toArray(content.props.children).find(
    (child) => child.props.value === value
  );

  return (
    <View {...props}>
      <Pressable onPress={() => setModalVisible(true)} style={styles.trigger}>
        {selectedItem ? (
          <Text style={styles.selectedText}>{selectedItem.props.children}</Text>
        ) : (
          <Text style={styles.placeholderText}>Select an option</Text>
        )}
        <ChevronDown size={20} color="#e5e7eb" style={styles.icon} />
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.content}>
            {React.Children.map(content.props.children, (child) =>
              React.cloneElement(child, {
                onPress: () => {
                  onValueChange(child.props.value);
                  setModalVisible(false);
                },
              })
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export function SelectTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function SelectContent({ children, ...props }) {
  return React.cloneElement(children, { isContent: true, ...props });
}

export function SelectItem({ children, value, onPress, ...props }) {
  return (
    <Pressable style={styles.item} onPress={onPress} {...props}>
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedText: {
    color: 'white',
    fontSize: 16,
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  icon: {
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    minWidth: 200,
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

export default Select;