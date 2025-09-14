import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../lib/theme';
import { getSupabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { hmsJoin, hmsIsConnected, hmsToggleLocalMute, hmsLeave } from '../lib/hmsClient';
import { handRaise, handLower } from '../../lib/api';
import { subscribeParticipants, ParticipantRow, subscribeMessages, sendMessage } from '../lib/realtime';

type Room = { id: string; title: string; created_at: string };

export default function Rooms() {
  const router = useRouter();
  const supabase = getSupabase();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [title, setTitle] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);

  const fetchRooms = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      const mappedRooms = data.map((room: any) => ({
        id: room.id,
        title: room.title || 'Room',
        created_at: room.created_at,
      }));
      setRooms(mappedRooms as Room[]);
    }
  }, []);

  React.useEffect(() => {
    fetchRooms();
    
    // Health check on mount (non-blocking, log-only)
    api.health().then(
      () => console.log("[api] health ok"),
      (e) => console.log("[api] health failed", String(e?.message || e))
    );
    
    const channel = supabase
      .channel('rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        // Refetch to stay consistent across columns (title/name etc.)
        fetchRooms();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms]);

  // Refetch when tab/screen gains focus
  useFocusEffect(React.useCallback(() => {
    fetchRooms();
    return () => {};
  }, [fetchRooms]));

  const createRoom = async () => {
    if (!title.trim()) {
      console.log('[createRoom] No title provided');
      return;
    }
    
    console.log('[createRoom] Starting room creation with title:', title.trim());
    setLoading(true);
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('[createRoom] User not authenticated:', authError);
      setLoading(false);
      return;
    }
    
    console.log('[createRoom] User authenticated:', user.id);
    
    // Try title first (remote schema may not have name column); fallback to name.
    // IMPORTANT: include host_id (and keep owner_id) to satisfy NOT NULL / RLS.
    let data: any = null;
    let error: any = null;
    const insertTitle: Record<string, any> = {
      title: title.trim() || 'Room',
      host_id: user.id,
      owner_id: user.id,
    };
    let res = await supabase
      .from('rooms')
      .insert(insertTitle)
      .select('id')
      .maybeSingle();
    if (!res.error && res.data) {
      data = res.data;
    } else {
      error = res.error;
      const insertName: Record<string, any> = {
        name: title.trim() || 'Room',
        host_id: user.id,
        owner_id: user.id,
      };
      res = await supabase
        .from('rooms')
        .insert(insertName)
        .select('id')
        .maybeSingle();
      if (!res.error && res.data) {
        data = res.data;
        error = null;
      } else {
        error = error || res.error;
      }
    }
    
    setLoading(false);
    if (error) {
      console.log('[createRoom] Database error:', error);
      return;
    }
    
    console.log('[createRoom] Room created successfully:', data);
    setTitle('');
    // Ensure host membership
    try {
      console.log('[createRoom] (backend) host membership', { room_id: data!.id, user_id: user.id, role: 'host' });
      await api.joinRoom(data!.id, user.id, 'host');
    } catch (err) {
      console.log('[createRoom] host backend error:', err);
    }
    router.push(`/room/${data!.id}`);
  };

  const [localMuted, setLocalMuted] = React.useState(true);
  const [myRole, setMyRole] = React.useState<'host'|'speaker'|'listener'>('listener');
  const [connected, setConnected] = React.useState(false);
  const [roomId, setRoomId] = React.useState<string | null>(null);
  const [peers, setPeers] = React.useState<any[]>([]);
  const [participantCount, setParticipantCount] = React.useState<number>(0);
  const participantsUnsub = React.useRef<null | (() => void)>(null);
  const [msgs, setMsgs] = React.useState<any[]>([]);
  const messagesUnsub = React.useRef<null | (() => void)>(null);
  const [msgText, setMsgText] = React.useState('');

  const joinRoom = async (roomId: string, role: 'listener' | 'speaker' | 'host' = 'listener') => {
    try {
      setJoiningId(roomId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('تسجيل الدخول مطلوب');
        return;
      }
      // backend membership
      await api.joinRoom(roomId, user.id, role);
      // get HMS token and join immediately (avoid double-join if already connected)
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'ضيف';
      const token = await api.getHMSToken(roomId, user.id, name, role as any);
      const already = await hmsIsConnected();
      if (!already) {
        await hmsJoin(token, name, role as any);
        setMyRole(role as any);
        setLocalMuted(role === 'listener');
        setConnected(true);
        setRoomId(roomId);
      }
      router.push(`/room/${roomId}`);
    } catch (e: any) {
      console.log('[rooms] join error', e?.message || String(e));
      Alert.alert('خطأ في الانضمام', e?.message || '');
    } finally {
      setJoiningId(null);
    }
  };

  const onMicPress = async (roomId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !roomId) return;
    if (myRole === 'listener') {
      try { await handRaise(roomId, user.id); Alert.alert('✋', 'تم طلب رفع اليد'); } catch (e:any) { Alert.alert('تعذر', e?.message || ''); }
      return;
    }
    const next = !localMuted;
    await hmsToggleLocalMute(next);
    setLocalMuted(next);
  };

  // Realtime subscriptions when connected
  React.useEffect(() => {
    if (!connected || !roomId) return;
    if (participantsUnsub.current) { participantsUnsub.current(); participantsUnsub.current = null; }
    participantsUnsub.current = subscribeParticipants(roomId, (rows: ParticipantRow[]) => {
      setParticipantCount(rows.length);
    });
    if (messagesUnsub.current) { messagesUnsub.current(); messagesUnsub.current = null; }
    messagesUnsub.current = subscribeMessages(roomId, (rows: any[]) => setMsgs(rows));
    return () => {
      if (participantsUnsub.current) { participantsUnsub.current(); participantsUnsub.current = null; }
      if (messagesUnsub.current) { messagesUnsub.current(); messagesUnsub.current = null; }
    };
  }, [connected, roomId]);

  const leave = React.useCallback(async () => {
    try { await hmsLeave(); } catch (e) {}
    setConnected(false);
    setPeers([]);
    setRoomId(null);
    if (participantsUnsub.current) { participantsUnsub.current(); participantsUnsub.current = null; }
    if (messagesUnsub.current) { messagesUnsub.current(); messagesUnsub.current = null; }
    setParticipantCount(0);
    setMsgs([]);
  }, []);

  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.creator}>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسم الغرفة"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
          textAlign="right"
        />
        <Pressable disabled={loading} onPress={createRoom} style={styles.makeBtn}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800' }}>{loading ? '...' : 'إنشاء'}</Text>
          </Pressable>
        </View>

      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.roomRow}>
            <MaterialCommunityIcons name="account-voice" size={20} color={PALETTE.primaryDark} />
            <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
            <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
              <Pressable onPress={() => joinRoom(item.id, 'listener')} style={styles.joinBtn}>
                <Ionicons name="enter-outline" size={16} color="#fff" />
                <Text style={styles.joinTxt}>{joiningId === item.id ? '...' : 'انضم'}</Text>
              </Pressable>
              <Pressable onPress={() => router.push(`/room/${item.id}`)} style={styles.goBtn}>
                <Ionicons name="chevron-back" size={16} color={PALETTE.primaryDark} />
                <Text style={styles.goTxt}>فتح</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Show participant badge when connected */}
      {connected && (
        <>
          {/* participant badge */}
          <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
            <View style={{
              paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999,
              backgroundColor: '#e2e8f0'
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', writingDirection: 'rtl' }}>
                المتواجدون: {participantCount}
              </Text>
            </View>
          </View>

          {/* chat overlay */}
          <View style={{ position: 'absolute', bottom: 70, left: 12, right: 12, maxHeight: 180 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 8 }}>
              <Text style={{ fontWeight: '700', textAlign: 'right' }}>الدردشة</Text>
              <FlatList
                data={msgs}
                keyExtractor={(m:any) => m.id}
                renderItem={({ item }) => (
                  <Text style={{ textAlign: 'right' }}>{item.text}</Text>
                )}
                inverted={true}
                contentContainerStyle={{ flexDirection: 'column-reverse' }}
                style={{ maxHeight: 120 }}
              />
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 6 }}>
                <TouchableOpacity onPress={() => setMsgText((t) => t + '👏')}>
                  <Text style={{ fontSize: 18, marginHorizontal: 6 }}>👏</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMsgText((t) => t + '❤️')}>
                  <Text style={{ fontSize: 18, marginHorizontal: 6 }}>❤️</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <TextInput
                    value={msgText}
                    onChangeText={setMsgText}
                    placeholder="اكتب رسالة…"
                    style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8, textAlign: 'right' }}
                  />
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user || !roomId) return;
                    await sendMessage(roomId, user.id, msgText);
                    setMsgText('');
                  }}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#0ea5e9', borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>إرسال</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  creator: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  input: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontWeight: '700',
    shadowColor: '#800F2F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  makeBtn: { 
    backgroundColor: PALETTE.primary, 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'row-reverse', 
    gap: 6,
    shadowColor: '#800F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  roomRow: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    gap: 10,
    shadowColor: '#800F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roomTitle: { flex: 1, textAlign: 'right', fontWeight: '800' },
  joinBtn: { backgroundColor: PALETTE.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, flexDirection:'row-reverse', alignItems:'center', gap:6 },
  joinTxt: { color:'#fff', fontWeight:'800' },
  goBtn: { backgroundColor: '#fff0f3', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, flexDirection:'row-reverse', alignItems:'center', gap:6, borderWidth:1, borderColor:'#ffd5e0' },
  goTxt: { color: PALETTE.primaryDark, fontWeight:'800' },
});
