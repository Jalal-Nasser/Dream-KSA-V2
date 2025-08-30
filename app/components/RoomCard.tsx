import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RoomCard({
  title,
  listeners = 0,
  agency,
  featured = false,
}: { title: string; listeners?: number; agency?: string; featured?: boolean }) {
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
        <Text style={styles.count}>{listeners}</Text>
        <Text style={styles.countSub}>مستمع</Text>
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
  countSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
});
