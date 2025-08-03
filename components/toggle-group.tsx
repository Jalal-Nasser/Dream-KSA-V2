import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const ToggleGroup = ({ children, type = 'single', defaultValue, ...props }) => {
  const [activeItems, setActiveItems] = useState(
    type === 'single' ? [defaultValue] : defaultValue || []
  );

  const handleToggle = (value) => {
    if (type === 'single') {
      setActiveItems(activeItems[0] === value ? [] : [value]);
    } else {
      setActiveItems((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  return (
    <View style={styles.container} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type) {
          const value = child.props.value;
          return React.cloneElement(child, {
            pressed: activeItems.includes(value),
            onPress: () => handleToggle(value),
          });
        }
        return child;
      })}
    </View>
  );
};

export function ToggleGroupItem({ children, ...props }) {
  // This is a placeholder for the item. The logic is handled by the parent component.
  return <View {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
});

export default ToggleGroup;