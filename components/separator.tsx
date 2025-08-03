import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Separator({ orientation = 'horizontal', decorative = false, ...props }) {
  return (
    <View
      style={[styles.base, orientation === 'vertical' ? styles.vertical : styles.horizontal]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#4b5563',
  },
  horizontal: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  vertical: {
    width: 1,
    height: '100%',
    marginHorizontal: 16,
  },
});