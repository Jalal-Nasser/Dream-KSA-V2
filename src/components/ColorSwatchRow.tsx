import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

interface ColorSwatchRowProps {
  presets: string[];
  value: string;
  onPick: (hex: string) => void;
}

export default function ColorSwatchRow({ presets, value, onPick }: ColorSwatchRowProps) {
  return (
    <View style={styles.container}>
      {presets.map((hex) => (
        <Pressable
          key={hex}
          onPress={() => onPick(hex)}
          style={[
            styles.swatch,
            { backgroundColor: hex },
            value === hex ? styles.selectedSwatch : styles.defaultSwatch
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  defaultSwatch: {
    borderColor: '#374151', // neutral-700
  },
  selectedSwatch: {
    borderColor: 'white',
    borderWidth: 3,
    shadowColor: '#3B82F6', // blue-400
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
});
