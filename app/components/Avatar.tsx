import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Avatar({
  name = 'ضيف',
  size = 56,
  muted = false,
  vip = false,
}: { name?: string; size?: number; muted?: boolean; vip?: boolean }) {
  const initials = name.trim()[0]?.toUpperCase() || 'D';
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size/2 }]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size/2 }]}>
        <Text style={[styles.letter, { fontSize: size * 0.38 }]}>{initials}</Text>
      </View>
      {vip && (
        <View style={styles.vip}>
          <Ionicons name="sparkles" size={12} color="#FFD166" />
        </View>
      )}
      {muted && (
        <View style={styles.muted}>
          <Ionicons name="mic-off" size={12} color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circle: { backgroundColor: '#172138', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  letter: { color: '#fff', fontWeight: '800' },
  muted: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#e21b73', borderRadius: 10, padding: 3 },
  vip: { position: 'absolute', top: -2, left: -2, backgroundColor: '#222', borderRadius: 10, padding: 3 },
});
