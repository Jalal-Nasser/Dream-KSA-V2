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
        <View style={[styles.avatar, agency ? styles.avatarAgency : null]}><Text style={styles.letter}>{(agency || 'D')[0]}</Text></View>
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text numberOfLines={1} style={styles.sub}>{agency || 'Dream KSA'}</Text>
          {agency && <View style={styles.agencyBadge}><Text style={styles.agencyTxt}>وكالة</Text></View>}
        </View>
      </View>
      <View style={styles.right}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="people" size={14} color="#333" />
          <Text style={styles.count}>{listeners}</Text>
        </View>
        <TouchableOpacity
          style={styles.join}
          activeOpacity={0.95}
          onPress={() => router.push({ pathname: '/room/[id]', params: { id: String(Math.random()).slice(2,7), name: title } })}
        >
          <Ionicons name="mic" size={14} color="#fff" />
          <Text style={styles.joinTxt}>ادخل</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  featured: { borderWidth: 1, borderColor: 'rgba(0,200,83,0.12)' },
  left: { marginRight: 6 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center' },
  avatarAgency: { backgroundColor: '#FFEDE6' },
  letter: { color: '#333', fontWeight: '700' },
  title: { color: '#111827', fontSize: 16, fontWeight: '800' },
  sub: { color: '#6B7280', marginTop: 2, fontSize: 12 },
  agencyBadge: { backgroundColor: '#E7F7EF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  agencyTxt: { color: '#00A651', fontSize: 11, fontWeight: '800' },
  right: { alignItems: 'center', paddingLeft: 8 },
  count: { color: '#374151', fontWeight: '700', marginLeft: 6 },
  join: { marginTop: 8, backgroundColor: '#00C853', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  joinTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
