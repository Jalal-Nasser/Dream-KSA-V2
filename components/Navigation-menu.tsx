import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

const NavigationMenu = ({ children, ...props }) => {
  return (
    <View style={styles.container} {...props}>
      {children}
    </View>
  );
};

export function NavigationMenuList({ children, ...props }) {
  return <View style={styles.list} {...props}>{children}</View>;
}

export function NavigationMenuItem({ children, ...props }) {
  return <View style={styles.item} {...props}>{children}</View>;
}

export function NavigationMenuLink({ children, href, ...props }) {
  return (
    <Pressable onPress={() => console.log('Navigate to:', href)} style={styles.link} {...props}>
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

export function NavigationMenuContent({ children, ...props }) {
  // You would need to handle this with a modal or conditional rendering
  return <View style={styles.content} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    // Top-level container styles
  },
  list: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 16,
  },
  item: {
    // Styles for each item
  },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  content: {
    // This would be a popover, likely a modal in RN
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default NavigationMenu;