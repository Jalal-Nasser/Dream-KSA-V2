import React from 'react';
import { View, Pressable } from 'react-native';

interface ColorSwatchRowProps {
  onPick: (hex: string) => void;
  selectedColor?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#4F46E5', // Indigo
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#10B981', // Emerald
  '#3B82F6', // Blue
];

export default function ColorSwatchRow({ 
  onPick, 
  selectedColor, 
  colors = DEFAULT_COLORS 
}: ColorSwatchRowProps) {
  return (
    <View className="flex-row gap-3 justify-center">
      {colors.map((color) => (
        <Pressable
          key={color}
          onPress={() => onPick(color)}
          className={`w-10 h-10 rounded-full border-2 ${
            selectedColor === color 
              ? 'border-white shadow-lg' 
              : 'border-gray-600'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </View>
  );
}
