import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function ProgressBar({ value, max, ...props }) {
  const progressValue = value / max;
  return (
    <View style={styles.container} {...props}>
      <Progress.Bar
        progress={progressValue}
        width={null}
        color="#3b82f6"
        unfilledColor="#374151"
        borderColor="transparent"
        height={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
  },
});