import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Check } from 'lucide-react-native';

const RadioGroup = ({ children, value, onValueChange, ...props }) => {
  return (
    <View {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: value === child.props.value,
            onPress: () => onValueChange(child.props.value),
          });
        }
        return child;
      })}
    </View>
  );
};

export function RadioGroupItem({ children, checked, onPress, ...props }) {
  return (
    <Pressable style={styles.item} onPress={onPress} {...props}>
      <View style={[styles.radio, checked && styles.radioChecked]}>
        {checked && <View style={styles.radioIndicator} />}
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioChecked: {
    borderColor: '#3b82f6',
  },
  radioIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
});

export default RadioGroup;