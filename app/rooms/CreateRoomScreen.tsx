import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function CreateRoomScreen() {
  const [name, setName] = useState('');
  const router = useRouter();
  const onCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert('Login required');
    // Try minimal insert compatible with remote schema: prefer "name", fallback to "title".
    let created: any = null;
    let errMsg = '';
    // Attempt with name
    let res = await supabase.from('rooms').insert({ name }).select('*').maybeSingle();
    if (!res.error && res.data) {
      created = res.data;
    } else {
      errMsg = res.error?.message || '';
      // Fallback with title
      res = await supabase.from('rooms').insert({ title: name }).select('*').maybeSingle();
      if (!res.error && res.data) {
        created = res.data;
      } else {
        return Alert.alert('Error', res.error?.message || errMsg || 'Failed to create room');
      }
    }
    await supabase.from('room_members').upsert({ room_id: created.id, user_id: user.id, role: 'host' });
    router.replace({ pathname: '/rooms/RoomScreen', params: { roomId: created.id } });
  };
  return (
    <View style={{ padding: 16 }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Room name"
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 }}
      />
      <TouchableOpacity onPress={onCreate} style={{ backgroundColor: '#16a34a', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>Create & Join</Text>
      </TouchableOpacity>
    </View>
  );
}


