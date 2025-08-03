import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

export default function ScrollArea({ children, ...props }) {
  return (
    <ScrollView style={styles.container} {...props}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // Add any container styles for the scroll area
  },
});