import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VipBadge({ label='VIP', color='#FFD166' }: {label?: string;color?: string}) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Ionicons name="diamond" size={12} color={color} />
      <Text style={[styles.txt, { color }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge:{ flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, paddingHorizontal:8, paddingVertical:4, borderRadius:999 },
  txt:{ fontSize:12, fontWeight:'800' },
});
