import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';

const HoverCard = ({ children, ...props }) => {
  const [visible, setVisible] = useState(false);

  const trigger = React.Children.toArray(children).find((child) => child.props.isTrigger);
  const content = React.Children.toArray(children).find((child) => child.props.isContent);

  return (
    <View {...props}>
      <Pressable onPress={() => setVisible(!visible)}>
        {trigger}
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.card}>
            {content}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export function HoverCardTrigger({ children, ...props }) {
  return React.cloneElement(children, { isTrigger: true, ...props });
}

export function HoverCardContent({ children, ...props }) {
  return React.cloneElement(children, { isContent: true, ...props });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
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

export default HoverCard;