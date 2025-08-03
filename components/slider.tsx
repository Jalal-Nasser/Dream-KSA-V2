import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import CommunitySlider from '@react-native-community/slider';

interface SliderProps extends ViewProps {
  defaultValue?: number;
  value?: number;
  min?: number;
  max?: number;
  onValueChange?: (value: number) => void;
  // Note: Range sliders are not supported by the default community slider.
  // This implementation assumes a single thumb.
}

const Slider = ({
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  style,
  ...props
}: SliderProps) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <CommunitySlider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value ?? defaultValue}
        onValueChange={onValueChange}
        minimumTrackTintColor="#10B981" // Primary color
        maximumTrackTintColor="#D1D5DB" // Muted color
        thumbTintColor="#FFFFFF" // Background color for the thumb
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 16,
  },
  // To further customize the thumb, you can use the `thumbImage` prop
  // and for the track, you can place custom Views behind the slider.
});

export { Slider };