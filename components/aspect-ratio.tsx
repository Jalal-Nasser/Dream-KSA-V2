import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function AspectRatio({ ratio = 1, children, ...props }) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  return (
    <View
      onLayout={(event) => setLayout(event.nativeEvent.layout)}
      style={[{ width: layout.width, height: layout.width / ratio }, styles.container]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Optional styles for the container
  },
});