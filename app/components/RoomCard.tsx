import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RoomCard({
  title,
  listeners = 0,
  agency,
  featured = false,
}: { title: string; listeners?: number; agency?: string; featured?: boolean }) {
  const router = useRouter();
  return (
    <View style={[styles.card, featured && styles.featured]}>
      <View style={styles.left}>
        <View style={styles.avatar}><Text style={styles.letter}>{(agency || 'D')[0]}</Text></View>
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text numberOfLines={1} style={styles.sub}>{agency || 'Dream KSA'}</Text>
      </View>
      <View style={styles.right}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="people" size={14} color="#fff" />
          <Text style={styles.count}>{listeners}</Text>
        </View>
        <TouchableOpacity
          style={styles.join}
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: '/room/[id]', params: { id: String(Math.random()).slice(2,7), name: title } })}
        >
          <Ionicons name="radio" size={14} color="#fff" />
          <Text style={styles.joinTxt}>ادخل</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f1625',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featured: { borderWidth: 1, borderColor: 'rgba(226,27,115,0.35)' },
  left: { marginRight: 6 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#172138', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#fff', fontWeight: '700' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 2, fontSize: 12 },
  right: { alignItems: 'center', paddingLeft: 8 },
  count: { color: '#fff', fontWeight: '800' },
  join: { marginTop: 6, backgroundColor: '#e21b73', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  joinTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
