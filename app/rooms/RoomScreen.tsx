import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { HMSInstance } from '@100mslive/react-native-hms';

export default function RoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, hands, sendMessage, raiseHand } = useRoomRealtime(roomId!);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [text, setText] = useState('');
  const hmsRef = useRef<HMSInstance | null>(null);

  useEffect(() => {
    hmsRef.current = new HMSInstance();
    return () => {
      hmsRef.current?.leave();
    };
  }, []);

  const join = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert('Login required');
    
    try {
      console.log('[join] (backend) membership', { roomId, user_id: user.id, role: 'listener' });
      await api.joinRoom(roomId, user.id, 'listener');
    } catch (err) {
      console.log('[join] backend error:', err);
    }
    
    const resp = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/hms/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: user.id, role: 'listener', user_name: user.email?.split('@')[0] || 'Guest' })
    });
    const js = await resp.json();
    if (!resp.ok || !js?.token) return Alert.alert('HMS token error', JSON.stringify(js));
    await hmsRef.current?.join({ authToken: js.token, userName: user.email || 'Guest', captureNetworkAudio: true, isAudioMuted: false });
    setJoined(true);
  };

  const toggleMute = async () => {
    if (!hmsRef.current) return;
    if (muted) {
      await hmsRef.current.setLocalAudioEnabled(true);
      setMuted(false);
    } else {
      await hmsRef.current.setLocalAudioEnabled(false);
      setMuted(true);
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>Room</Text>
      {!joined ? (
        <TouchableOpacity onPress={join} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Join Voice</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={toggleMute} style={{ backgroundColor: '#111827', padding: 12, borderRadius: 10 }}>
            <Text style={{ color: '#fff' }}>{muted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={raiseHand} style={{ backgroundColor: '#f59e0b', padding: 12, borderRadius: 10 }}>
            <Text style={{ color: '#111827', fontWeight: '700' }}>Raise hand ✋</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ marginTop: 16, flex: 1 }}>
        <Text style={{ fontWeight: '700' }}>Chat</Text>
        <FlatList
          data={messages}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => <Text style={{ paddingVertical: 4 }}>• {item.body}</Text>}
        />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            style={{ flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10 }}
          />
          <TouchableOpacity
            onPress={() => {
              if (text.trim()) {
                sendMessage(text.trim());
                setText('');
              }
            }}
            style={{ backgroundColor: '#16a34a', padding: 12, borderRadius: 10 }}
          >
            <Text style={{ color: '#fff' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: '700' }}>Raised hands</Text>
        <FlatList
          data={hands.filter((h) => h.state === 'raised')}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => <Text>✋ {item.user_id}</Text>}
        />
      </View>
    </View>
  );
}


