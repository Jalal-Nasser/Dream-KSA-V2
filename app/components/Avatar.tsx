import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export type AvatarProps = {
  size?: number;
  name?: string;
  imageUrl?: string | null;
  badge?: 'mic' | 'hand' | null;
};

export default function Avatar({ size = 56, name = '', imageUrl, badge }: AvatarProps) {
  const initials = (name || '').trim().slice(0, 2).toUpperCase() || '??';
  return (
    <View style={[s.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={[s.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[s.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        </View>
      )}
      {badge && (
        <View style={s.badge}>
          <Text style={{ fontSize: 12 }}>{badge === 'mic' ? '🎙️' : '✋'}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: '#F2E6FF', overflow: 'hidden' },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F2FF' },
  initials: { fontWeight: '800', color: '#7B2BE2' },
  badge: {
    position: 'absolute', right: -2, bottom: -2, backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 4, paddingVertical: 0,
    borderWidth: 1, borderColor: '#eee',
  },
});
