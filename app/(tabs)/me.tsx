import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../components/Avatar';
import VipBadge from '../components/VipBadge';
import { useRouter } from 'expo-router';

// Lightweight /me tab — safe, self-contained replacement for the earlier wrapper.
export default function Me() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Avatar name="أحمد" size={96} vip />
        <Text style={styles.name}>أحمد</Text>
        <Text style={styles.sub}>عضو Dream KSA</Text>
        <View style={{ marginTop: 8 }}>
          <VipBadge label="VIP Gold" color="#FFD166" />
        </View>
      </View>

      <View style={styles.rows}>
        <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={() => router.push('/(tabs)/agencies')}>
          <Text style={styles.rowTxt}>وكالتي</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={() => router.push('/(tabs)/live')}>
          <Text style={styles.rowTxt}>الغرف التي أمتلكها</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={() => router.push('/(tabs)/index')}>
          <Text style={styles.rowTxt}>الإعدادات</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021', padding: 20 },
  header: { alignItems: 'center', marginTop: 8 },
  name: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 12 },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  rows: { marginTop: 28, gap: 12 },
  row: {
    backgroundColor: '#0f1625',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowTxt: { color: '#fff', fontWeight: '800' },
  rowArrow: { color: 'rgba(255,255,255,0.6)', fontSize: 18 },
});
