import * as React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';
import { useRoom } from '../../hooks/useRoom';
import { api } from "@/lib/api";
import VoiceBar from "@/components/rooms/VoiceBar"; 
import { useRoomRealtime } from '@/hooks/useRoomRealtime';
import { hmsJoin, hmsLeave, hmsSetLocalAudioEnabled, hmsIsConnected } from "@/lib/hmsClient";

type Msg = { id: string; from: string; text: string; at: number };
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

export default function RoomChat() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const chanRef = React.useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Existing hooks for participants and realtime events
  const { room, participants, joinRoom, leaveRoom } = useRoom(roomId!);
  const { hands } = useRoomRealtime(roomId!);

  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');
  
  // --- Voice State ---
  const [authUser, setAuthUser] = React.useState<any>(null);
  const [joining, setJoining] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const [connected, setConnected] = React.useState(false);
  const [handRaised, setHandRaised] = React.useState(false);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthUser(data?.user));
  }, []);
  const myId = React.useMemo(() => authUser?.id, [authUser?.id]);

  const my = React.useMemo(() => (participants || []).find((p: any) => p.user_id === myId), [participants, myId]);
  const myRole: "host" | "speaker" | "listener" = (my?.role as any) || "listener";

  // --- HMS Join/Leave Effect ---
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!roomId || !myId) return;
      try {
        setJoining(true);
        const name = my?.profile?.display || my?.profile?.username || "مستخدم";
        const token = await api.getHMSToken(roomId, myId, name);
        if (cancelled) return;
        await hmsJoin(token, name);
        setMuted(false);
        setConnected(await hmsIsConnected());
        console.log("[hms] join OK");
      } catch (e: any) {
        console.log("[hms] join error:", e?.message || String(e));
      } finally {
        if (!cancelled) setJoining(false);
      }
    })();
    return () => {
      cancelled = true;
      hmsLeave().catch(() => {});
    };
  }, [roomId, myId]);

  // --- Chat & Presence Effect ---
  React.useEffect(() => {
    if (!roomId) return;
    let mounted = true;
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: true }, presence: { key: uid() } }
    });
    chanRef.current = channel;

    channel.on('broadcast', { event: 'message' }, (payload) => {
      if (!mounted) return;
      setMessages((prev) => [...prev, payload.payload as Msg].slice(-200));
    });

    (async () => {
      if (myId) {
        const { error } = await joinRoom(myId);
        if (error) console.warn('Failed to join room:', error);
      }
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const displayName = my?.profile?.name || authUser?.email?.split('@')[0] || 'ضيف';
          await channel.track({ username: displayName });
        }
      });
    })();

    return () => {
      mounted = false;
      if (myId) {
        leaveRoom(myId).catch(() => {});
      }
      if (chanRef.current) supabase.removeChannel(chanRef.current);
      chanRef.current = null;
    };
  }, [roomId, myId]);

  const send = async () => {
    const displayName = my?.profile?.name || authUser?.email?.split('@')[0] || 'مستخدم';
    const msg: Msg = { id: uid(), from: displayName, text: text.trim(), at: Date.now() };
    if (!msg.text) return;
    setText('');
    await chanRef.current?.send({ type: 'broadcast', event: 'message', payload: msg });
    supabase.from('messages').insert({ room_id: roomId, user_id: authUser?.id, content: msg.text }).catch(()=>{});
  };

  // ---- VoiceBar Handlers ----
  async function onToggleMic() {
    if (!myId || !roomId) return;
    try {
      const nextMuted = !muted;
      await hmsSetLocalAudioEnabled(!nextMuted);
      setMuted(nextMuted);
      await api.setMicRole(roomId, myId, !nextMuted);
    } catch (e: any) {
      console.log("[mic] toggle failed:", e?.message || String(e));
    }
  }

  async function onToggleHand() {
    if (!myId || !roomId) return;
    try {
      if (handRaised) {
        await api.lowerHand(roomId, myId);
        setHandRaised(false);
      } else {
        await api.raiseHand(roomId, myId);
        setHandRaised(true);
      }
    } catch (e:any) { console.log("[hand] error", e?.message || String(e)); }
  }

  async function onLeave() {
    if (!myId || !roomId) {
        router.back?.();
        return;
    };
    try { await api.leaveRoom(roomId, myId); } catch {}
    try { await hmsLeave(); } catch {}
    router.back?.();
  }
    
  // --- UI tweaks ---
  const Chip = ({text, danger}:{text:string; danger?:boolean}) => (
    <View style={{
      position:"absolute", top: 6, alignSelf: "center",
      backgroundColor: danger ? "rgba(185,28,28,0.90)" : "rgba(0,0,0,0.45)",
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
    }}>
      <Text style={{ color:"#fff", fontSize:12 }}>{text}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <Pressable onPress={onLeave}><Ionicons name="chevron-forward" size={22} color={PALETTE.primaryDark} /></Pressable>
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
      
      {/* status chip removed intentionally; logs only */}


      {/* Voice bar above chat input (adjust bottom offset to your chat height) */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5 }}>
        <VoiceBar
          role={myRole}
          muted={muted}
          handRaised={handRaised}
          onToggleMic={onToggleMic}
          onToggleHand={onToggleHand}
          onLeave={onLeave}
        />
      </View>
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
