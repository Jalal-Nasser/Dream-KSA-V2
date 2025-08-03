import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text, Modal } from 'react-native';

const Tooltip = ({ children, ...props }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleLongPress = (event) => {
    const { pageX, pageY } = event.nativeEvent;
    setTooltipPosition({ x: pageX, y: pageY });
    setModalVisible(true);
  };

  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);
  const content = React.Children.toArray(children).find((child) => child.props.isContent);

  return (
    <View {...props}>
      <Pressable onLongPress={handleLongPress} onPressOut={() => setModalVisible(false)}>
        {trigger}
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.tooltip, { top: tooltipPosition.y + 20, left: tooltipPosition.x }]}>
            {content}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export function TooltipTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function TooltipContent({ children, ...props }) {
  return React.cloneElement(children, { isContent: true, ...props });
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 8,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Tooltip;