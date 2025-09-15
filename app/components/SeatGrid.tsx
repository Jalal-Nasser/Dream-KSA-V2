import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import Avatar from './Avatar';

type Role = 'host' | 'speaker' | 'listener';
export type SeatUser = { id: string; name?: string; imageUrl?: string | null; role: Role; handRaised?: boolean };

export default function SeatGrid({ users }: { users: SeatUser[] }) {
  const seats: (SeatUser | null)[] = [...users].slice(0, 12);
  while (seats.length < 12) seats.push(null);

  return (
    <View style={[styles.grid, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
      {seats.map((u, idx) => (
        <View key={idx} style={styles.seat}>
          {u ? (
            <>
              <Avatar
                size={64}
                name={u.name || u.id.slice(0, 6)}
                imageUrl={u.imageUrl}
                badge={u.handRaised ? 'hand' : (u.role !== 'listener' ? 'mic' : null)}
              />
              <Text numberOfLines={1} style={styles.name}>
                {(u.name || u.id.slice(0, 6))}
              </Text>
              <Text style={[styles.role, u.role !== 'listener' && styles.roleOn]}>
                {u.role === 'host' ? 'مالك' : u.role === 'speaker' ? 'متحدث' : 'مستمع'}
              </Text>
            </>
          ) : (
            <View style={styles.empty}><Text style={{ color: '#bbb' }}>—</Text></View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', justifyContent: 'space-between' },
  seat: { width: '23%', alignItems: 'center', marginBottom: 16 },
  name: { marginTop: 6, fontSize: 12, fontWeight: '700', color: '#222' },
  role: { fontSize: 10, color: '#999' },
  roleOn: { color: '#7B2BE2' },
  empty: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: '#eee',
    alignItems: 'center', justifyContent: 'center',
  },
});
