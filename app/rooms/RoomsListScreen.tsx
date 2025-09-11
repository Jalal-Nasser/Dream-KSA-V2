import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function RoomsListScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setRooms(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TouchableOpacity
        style={{ padding: 14, backgroundColor: '#2563eb', borderRadius: 12, marginBottom: 12 }}
        onPress={() => router.push('/rooms/CreateRoomScreen')}
      >
        <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>Create Room</Text>
      </TouchableOpacity>
      <FlatList
        data={rooms}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/rooms/RoomScreen', params: { roomId: item.id } })}
            style={{ padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 10 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title || item.name}</Text>
            <Text style={{ color: '#6b7280' }}>{item.is_live ? 'LIVE' : 'Offline'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}


