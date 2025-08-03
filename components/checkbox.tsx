import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';

export default function Checkbox({ checked, onCheckedChange, ...props }) {
  return (
    <Pressable
      style={[styles.container, checked && styles.checkedContainer]}
      onPress={() => onCheckedChange(!checked)}
      {...props}
    >
      {checked && <Check size={16} color="white" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedContainer: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
});