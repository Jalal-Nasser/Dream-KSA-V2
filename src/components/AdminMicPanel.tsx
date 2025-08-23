import React from 'react';
import { Text, View, Pressable, FlatList } from 'react-native';

type UserRow = { user_id: string; display_name?: string };
type PendingRow = { user_id: string; _priority?: number | null; _vipName?: string | null };

export function AdminMicPanel({
  isAdmin,
  speakers,
  pendingSorted,
  onApprove,
  onRevoke,
  maxSpeakers = 2,
}: {
  isAdmin: boolean;
  speakers: UserRow[];
  pendingSorted: PendingRow[];
  onApprove: (user_id: string) => void;
  onRevoke: (user_id: string) => void;
  maxSpeakers?: number;
}) {
  if (!isAdmin) return null;

  return (
    <View style={{ marginTop: 16, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '700' }}>Admin Mic Panel</Text>

      <View style={{ padding: 12, backgroundColor: '#0ea5e9', borderRadius: 12 }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Speakers ({speakers.length}/{maxSpeakers})
        </Text>
        {speakers.length === 0 ? (
          <Text style={{ color: 'white', marginTop: 6 }}>No one on mic</Text>
        ) : (
          <FlatList
            data={speakers}
            keyExtractor={(i) => i.user_id}
            renderItem={({ item }) => (
              <View style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>{item.display_name || item.user_id}</Text>
                <Pressable onPress={() => onRevoke(item.user_id)} style={{ padding: 6, backgroundColor: '#ef4444', borderRadius: 8 }}>
                  <Text style={{ color: 'white' }}>Revoke</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>

      <View style={{ padding: 12, backgroundColor: '#10b981', borderRadius: 12 }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Pending (VIP first)</Text>
        {pendingSorted.length === 0 ? (
          <Text style={{ color: 'white', marginTop: 6 }}>No requests</Text>
        ) : (
          <FlatList
            data={pendingSorted}
            keyExtractor={(i) => i.user_id}
            renderItem={({ item }) => (
              <View style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: 'white', fontWeight: '700' }}>{item.user_id}</Text>
                  {item._vipName ? (
                    <Text style={{ color: '#e2e8f0', fontSize: 12 }}>
                      VIP: {item._vipName} (prio {item._priority ?? 0})
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => onApprove(item.user_id)}
                  style={{ padding: 6, backgroundColor: '#22c55e', borderRadius: 8 }}
                >
                  <Text style={{ color: 'white' }}>Approve</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}


