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
    // Try minimal insert compatible with remote schema: prefer "title", fallback to "name".
    // IMPORTANT: include host_id (and owner_id if present) to satisfy NOT NULL / RLS.
    let created: any = null;
    let errMsg = '';
    // Attempt with title first
    const insertPayloadTitle: Record<string, any> = {
      title: (name ?? '').trim() || 'Room',
      host_id: user.id,
      owner_id: user.id,
    };
    let res = await supabase
      .from('rooms')
      .insert(insertPayloadTitle)
      .select('id')
      .maybeSingle();
    if (!res.error && res.data) {
      created = res.data;
    } else {
      errMsg = res.error?.message || '';
      // Fallback with name column
      const insertPayloadName: Record<string, any> = {
        name: (name ?? '').trim() || 'Room',
        host_id: user.id,
        owner_id: user.id,
      };
      res = await supabase
        .from('rooms')
        .insert(insertPayloadName)
        .select('id')
        .maybeSingle();
      if (!res.error && res.data) {
        created = res.data;
      } else {
        return Alert.alert('Error', res.error?.message || errMsg || 'Failed to create room');
      }
    }
    // Ensure host membership
    const { error: insErr } = await supabase.from('room_participants').insert({
      room_id: created.id,
      user_id: user.id,
      role: 'host',
      joined_at: new Date().toISOString(),
    });
    
    if (insErr) {
      console.log('[createRoom] host insert failed, trying update:', insErr);
      await supabase
        .from('room_participants')
        .update({ role: 'host' })
        .eq('room_id', created.id)
        .eq('user_id', user.id);
    }
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


