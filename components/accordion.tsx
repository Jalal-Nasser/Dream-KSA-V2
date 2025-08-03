import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';

const AccordionItem = ({ title, children, value, isExpanded, onToggle }) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isExpanded ? height.value : 0),
      opacity: withTiming(isExpanded ? opacity.value : 0),
    };
  });

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withSpring(isExpanded ? '180deg' : '0deg') }],
    };
  });

  const onLayout = (event) => {
    if (!height.value) {
      height.value = event.nativeEvent.layout.height;
    }
    opacity.value = 1;
  };

  return (
    <View style={styles.itemContainer}>
      <Pressable onPress={() => onToggle(value)} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <Animated.View style={chevronAnimatedStyle}>
          <ChevronDown color="#e5e7eb" size={24} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <View onLayout={onLayout} style={styles.contentInner}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

export default function Accordion({ children, type = 'single', defaultValue, ...props }) {
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
    <View style={styles.accordionContainer} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === AccordionItem) {
          const value = child.props.value || `item-${index}`;
          return React.cloneElement(child, {
            isExpanded: activeItems.includes(value),
            onToggle: handleToggle,
            value: value,
          });
        }
        return child;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  accordionContainer: {
    // Add any container styles here if needed
  },
  itemContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    overflow: 'hidden',
  },
  contentInner: {
    position: 'absolute',
    padding: 16,
    paddingTop: 0,
    width: '100%',
  },
});