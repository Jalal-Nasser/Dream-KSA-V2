import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { useRoom } from '../../hooks/useRoom';
import { HMSInstance } from '@100mslive/react-native-hms';
import VoiceBar from '../../components/rooms/VoiceBar';
import { Audio } from 'expo-av';

export default function RoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { messages, hands, sendMessage, raiseHand } = useRoomRealtime(roomId!);
  const { participants, joinRoom, leaveRoom, setMicRole, raiseHand: raiseHandBackend, lowerHand } = useRoom(roomId!);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const hmsRef = useRef<HMSInstance | null>(null);

  // Get current user's role and info
  const meId = useMemo(() => currentUser?.id, [currentUser]);
  const my = useMemo(() => participants.find(p => p.user_id === meId), [participants, meId]);
  const myRole: "host" | "speaker" | "listener" = (my?.role as any) || "listener";

  useEffect(() => {
    hmsRef.current = new HMSInstance();
    
    // Request audio permission
    Audio.requestPermissionsAsync().catch(() => {});
    
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
    
    return () => {
      hmsRef.current?.leave();
      // Leave room when component unmounts
      if (currentUser && joined) {
        leaveRoom(currentUser.id).catch(() => {});
      }
    };
  }, [currentUser, joined]);

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

  const onToggleMic = async () => {
    try {
      const enableSpeaking = muted; // if muted -> enable
      await api.setMicRole(roomId, meId!, enableSpeaking);
      setMuted(!muted);
      console.log("[mic] toggled ->", !muted);
    } catch (e) {
      console.log("[mic] toggle error", String((e as any)?.message || e));
    }
  };

  const onRaiseLower = async () => {
    try {
      const raised = hands?.some((h) => h.user_id === meId);
      if (raised) await api.lowerHand(roomId, meId!);
      else await api.raiseHand(roomId, meId!);
      console.log("[hand] toggled ->", !raised);
    } catch (e) {
      console.log("[hand] error", String((e as any)?.message || e));
    }
  };

  const onLeave = async () => {
    try {
      await api.leaveRoom(roomId, meId!);
    } catch (e) {
      console.log("[leave] backend error (ignored)", String((e as any)?.message || e));
    } finally {
      router.back?.();
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
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
          <Text style={{ color: '#666', textAlign: 'center' }}>متصل بالصوت</Text>
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

      {/* Voice controls bar - only show when joined */}
      {joined && (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 64, zIndex: 5 }}>
          <VoiceBar
            role={myRole}
            muted={muted}
            onToggleMic={onToggleMic}
            onRaiseLower={onRaiseLower}
            onLeave={onLeave}
          />
        </View>
      )}
    </View>
  );
}


