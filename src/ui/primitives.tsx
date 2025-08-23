import React, { PropsWithChildren } from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import { theme } from './theme';

export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[{ flex: 1, backgroundColor: theme.colors.bg, padding: 16 }, style]}>{children}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.cardBorder,
          borderWidth: 1,
          borderRadius: theme.radius,
          padding: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Title({ children }: PropsWithChildren) {
  return <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800' }}>{children}</Text>;
}

export function Subtle({ children }: PropsWithChildren) {
  return <Text style={{ color: theme.colors.subtext }}>{children}</Text>;
}

export function Button({ label, onPress, tone = 'primary' as 'primary' | 'danger' | 'success' }) {
  const map = {
    primary: theme.colors.primary,
    danger: theme.colors.danger,
    success: theme.colors.success,
  } as const;
  return (
    <Pressable onPress={onPress} style={{ padding: 12, backgroundColor: map[tone], borderRadius: theme.radius }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}





