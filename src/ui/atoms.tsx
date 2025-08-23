import React, { PropsWithChildren } from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const t = useTheme();
  return <View style={[{ flex: 1, backgroundColor: t.colors.bg, padding: 16 }, style]}>{children}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const t = useTheme();
  return (
    <View style={[{ backgroundColor: t.colors.surface, borderColor: t.colors.surfaceBorder, borderWidth: 1, borderRadius: t.radius, padding: 14 }, t.shadow.card, style]}>
      {children}
    </View>
  );
}

export const Title = ({ children }: PropsWithChildren) => { const t = useTheme(); return <Text style={[t.fonts.title, { color: t.colors.text }]}>{children}</Text>; };
export const Subtle = ({ children }: PropsWithChildren) => { const t = useTheme(); return <Text style={{ color: t.colors.subtext }}>{children}</Text>; };

export function Pill({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const t = useTheme();
  return <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' }, style]}><Text style={{ color: t.colors.text, fontSize: 12, fontWeight: '700' }}>{children}</Text></View>;
}

export function Button({ label, onPress, tone = 'primary' as 'primary'|'danger'|'success' }) {
  const t = useTheme(); const map = { primary: t.colors.primary, danger: t.colors.danger, success: t.colors.success } as const;
  return (<Pressable onPress={onPress} style={{ padding: 12, backgroundColor: map[tone], borderRadius: t.radius }}><Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{label}</Text></Pressable>);
}





