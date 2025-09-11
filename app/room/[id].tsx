import * as React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSupabase, supabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';
import { useRoom } from '../../hooks/useRoom';
import { Audio } from "expo-av";
import { useHMSActions, useHMSStore, selectIsConnectedToRoom, selectIsLocalAudioEnabled } from "@100mslive/react-native-hms";
import { api } from "@/lib/api";
import VoiceBar from "@/components/rooms/VoiceBar"; 
import { useRoomRealtime } from '@/hooks/useRoomRealtime';


type Msg = { id: string; from: string; text: string; at: number };
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

export default function RoomChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  // const supabase = getSupabase(); // supabase is directly imported now
  const chanRef = React.useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Use room hook for participant management
  const { room, participants, joinRoom, leaveRoom, setMicRole } = useRoom(id!);
  const { hands } = useRoomRealtime(id!);


  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');
  const [peers, setPeers] = React.useState<string[]>([]);
  const [hasJoined, setHasJoined] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<any>(null);
  React.useEffect(() => { supabase.auth.getUser().then(({ data }) => setAuthUser(data?.user)); }, []);
  const myId = React.useMemo(() => authUser?.id, [authUser?.id]);

  // ---- 100ms hooks ----
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const [joining, setJoining] = React.useState(false);
  
  // derive my current role in your app (speaker/host/listener) from participants
  const my = React.useMemo(() => (participants || []).find((p: any) => p.user_id === myId), [participants, myId]);
  const myRole: "host" | "speaker" | "listener" = (my?.role as any) || "listener";


  React.useEffect(() => {
    let mounted = true;
    const channel = supabase.channel(`room:${id}`, {
      config: { broadcast: { self: true }, presence: { key: uid() } }
    });
    chanRef.current = channel;

    // ---- join 100ms on mount ----
    let cancelled = false;
    (async () => {
      if (!id || !myId) return;
      try {
        setJoining(true);
        await Audio.requestPermissionsAsync().catch(() => {});
        // name preference: display_name -> username -> masked email -> fallback
        const name =
          my?.profile?.display ||
          my?.profile?.display_name ||
          my?.profile?.username ||
          "مستخدم";
        const token = await api.getHMSToken(id, myId, name);
        if (cancelled) return;
        if (token) {
          await hmsActions.join({ authToken: token, userName: name });
          console.log("[hms] join OK");
        } else {
          console.log("[hms] join error: token is missing");
        }
      } catch (e: any) {
        console.log("[hms] join error:", e?.message || String(e));
      } finally {
        setJoining(false);
      }
    })();

    channel.on('broadcast', { event: 'message' }, (payload) => {
      if (!mounted) return;
      const m = payload.payload as Msg;
      setMessages((prev) => [...prev, m].slice(-200));
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const list: string[] = [];
      Object.values(state).forEach((arr: any) => (arr as any[]).forEach((p: any) => list.push(p.username)));
      setPeers(list);
    });

    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user && !hasJoined) {
        // Auto-join room when entering
        const { error } = await joinRoom(user.id);
        if (!error) {
          setHasJoined(true);
        } else {
          console.warn('Failed to join room:', error);
        }
      }
      
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Find user's display name from participants
          const userParticipant = participants.find(p => p.user_id === user?.id);
          const displayName = userParticipant?.profile?.name || user?.email?.split('@')[0] || 'ضيف';
          await channel.track({ username: displayName });
        }
      });
    })();

    return () => {
      mounted = false;
      // Leave room when component unmounts
      (async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (user && hasJoined) {
          await leaveRoom(user.id);
        }
      })();
      
      if (chanRef.current) supabase.removeChannel(chanRef.current);
      chanRef.current = null;
      // leave 100ms when screen unmounts
      hmsActions.leave().catch(() => {});
    };
  }, [id, hasJoined, myId]);

  const send = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    // Find user's display name from participants
    const userParticipant = participants.find(p => p.user_id === user?.id);
    const displayName = userParticipant?.profile?.name || user?.email?.split('@')[0] || 'مستخدم';
    const msg: Msg = { id: uid(), from: displayName, text: text.trim(), at: Date.now() };
    if (!msg.text) return;
    setText('');
    await chanRef.current?.send({ type: 'broadcast', event: 'message', payload: msg });
    supabase.from('messages').insert({ room_id: id, user_id: authUser?.id, content: msg.text }).catch(()=>{});
  };

  // ---- controls handlers ----
  async function onToggleMic() {
    if (!myId) return;
    try {
      // Prefer high-level toggle
      await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
      // Also reflect on your backend role if you use it to gate speaking
      const enableSpeaking = !isLocalAudioEnabled;
      await api.setMicRole(id!, myId!, enableSpeaking);
    } catch (e: any) {
      console.log("[mic] toggle failed:", e?.message || String(e));
    }
  }

  async function onRaiseLower() {
    if (!myId) return;
    try {
      const raised = (hands || []).some((h: any) => h.user_id === myId);
      if (raised) await api.lowerHand(id!, myId!);
      else await api.raiseHand(id!, myId!);
    } catch (e: any) {
      console.log("[hand] error:", e?.message || String(e));
    }
  }

  async function onLeave() {
    if (!myId) return;
    try {
      await leaveRoom(myId);
    } catch {}
    try {
      await hmsActions.leave();
    } catch {}
    router.back?.();
  }
    
  // ---- UI ----
  const showVoiceBar = true; 
  const muted = !isLocalAudioEnabled;

  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-forward" size={22} color={PALETTE.primaryDark} /></Pressable>
        <Text style={styles.title}>{room?.name || 'غرفة دردشة'}</Text>
        <View style={{ minWidth:22, alignItems:'flex-end' }}>
          <Text style={styles.badge}>{participants.length}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m)=>m.id}
        contentContainerStyle={{ padding:12, gap:8 }}
        renderItem={({item}) => (
          <View style={[styles.bubble, { alignSelf: item.from === 'أنا' ? 'flex-end' : 'flex-start' }]}>
            <Text style={styles.from}>{item.from}</Text>
            <Text style={styles.txt}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <Pressable onPress={send} style={styles.sendBtn}><Ionicons name="send" size={16} color="#fff"/></Pressable>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="اكتب رسالة…"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
      </View>
      
      {/* small connection hint */}
      {joining && (
        <View style={{ position: "absolute", top: 12, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
          <Text style={{ color: "#fff" }}>جارٍ الاتصال بالصوت…</Text>
        </View>
      )}
      {!joining && !isConnected && (
        <View style={{ position: "absolute", top: 12, alignSelf: "center", backgroundColor: "rgba(185,28,28,0.85)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
          <Text style={{ color: "#fff" }}>غير متصل بالصوت</Text>
        </View>
      )}

      {/* Voice bar above chat input (adjust bottom offset to your chat height) */}
      {showVoiceBar && (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5 }}>
          <VoiceBar
            role={myRole}
            muted={muted}
            onToggleMic={onToggleMic}
            onRaiseLower={onRaiseLower}
            onLeave={onLeave}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:{ flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingVertical:10, backgroundColor:'#fff' },
  title:{ fontWeight:'900', color:PALETTE.primaryDark },
  badge:{ backgroundColor:PALETTE.primary, color:'#fff', fontWeight:'800', paddingHorizontal:8, borderRadius:999 },
  bubble:{ backgroundColor:'#fff', borderRadius:12, padding:10, maxWidth:'86%' },
  from:{ fontSize:11, color:'#6B7280', textAlign:'right' },
  txt:{ fontSize:15, fontWeight:'600', textAlign:'right' },
  inputRow:{ flexDirection:'row-reverse', alignItems:'center', gap:8, padding:12, backgroundColor:'#fff' },
  input:{ flex:1, backgroundColor:PALETTE.soft2, borderRadius:12, paddingHorizontal:12, paddingVertical:10, fontWeight:'700' },
  sendBtn:{ backgroundColor:PALETTE.primary, borderRadius:12, padding:10, justifyContent:'center', alignItems:'center' },
});
