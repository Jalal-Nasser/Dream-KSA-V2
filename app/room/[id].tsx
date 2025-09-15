import * as React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Image } from 'react-native';
import ChatPanel from '../components/ChatPanel';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';
import { useRoom } from '../../hooks/useRoom';
import { api } from '../../lib/api';
import VoiceBar from '../../components/rooms/VoiceBar';
import { useRoomRealtime } from '../../hooks/useRoomRealtime';
import { hmsJoin, hmsLeave, hmsToggleLocalMute, hmsIsConnected } from '../../lib/hmsClient';

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
  const [showChat, setShowChat] = React.useState(false);
  
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
        // Ensure backend membership so participants list reflects instantly
        try { await api.joinRoom(roomId, myId, myRole); } catch {}
        const token = await api.getHMSToken(roomId, myId, name, myRole as any);
        if (cancelled) return;
        await hmsJoin(token, name, myRole);
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
      await hmsToggleLocalMute(nextMuted);
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

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FBFD' }}>
      {/* Binmo-style Header */}
      <View style={styles.binmoHeader}>
        <Pressable onPress={onLeave} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.roomTitle}>{room?.name || 'غرفة دردشة'}</Text>
          <View style={styles.participantBadge}>
            <Text style={styles.participantCount}>{participants.length}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.participantLabel}>المتواجدون ({participants.length})</Text>
        </View>
      </View>

      {/* Participants Row - Binmo Style */}
      <View style={styles.participantsSection}>
        <View style={styles.participantsRow}>
          {(participants || []).map((p:any, index) => (
            <View key={`${p.user_id}`} style={styles.participantTag}>
              <Text style={styles.participantId}>{p.user_id.slice(0,6)}</Text>
              <Text style={styles.participantIcon}>
                {p.role === 'host' || p.role==='owner' ? '👑' : p.role==='speaker' ? '🎙️' : '👂'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Main Chat Area - Show messages like Binmo */}
      <View style={styles.chatArea}>
        {messages.length > 0 && (
          <View style={styles.messageContainer}>
            {messages.slice(-5).map((msg, index) => (
              <View key={msg.id} style={[styles.messageBubble, { alignSelf: 'flex-end' }]}>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Empty main area - chat only shows in panel */}

      {/* Floating buttons */}
      <Pressable
        onPress={() => setShowChat(true)}
        style={styles.floatingChatBtn}>
        <Text style={{ fontSize: 16 }}>💬</Text>
      </Pressable>
      
      {process.env.EXPO_PUBLIC_DEMO_MODE && (
        <Pressable
          onPress={() => router.push('/demo/explore')}
          style={styles.floatingHomeBtn}>
          <Text style={{ fontSize: 16 }}>🏠</Text>
        </Pressable>
      )}

      {/* Voice Controls */}
      <View style={styles.voiceControls}>
        <VoiceBar
          role={myRole}
          muted={muted}
          handRaised={handRaised}
          onToggleMic={onToggleMic}
          onToggleHand={onToggleHand}
          onLeave={onLeave}
        />
      </View>

      {/* Chat Panel */}
      <ChatPanel
        visible={showChat}
        onClose={() => setShowChat(false)}
        roomId={String(roomId)}
        meUserId={(myId as any) || (authUser?.id as any) || 'me'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  binmoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginRight: 8,
  },
  participantBadge: {
    backgroundColor: '#EA4C89',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  participantCount: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  participantLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  participantsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  participantsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  participantTag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  participantId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  participantIcon: {
    fontSize: 12,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F7FBFD',
  },
  bottomPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  chatLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 18,
    color: '#999',
  },
  giftsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 4,
    gap: 8,
  },
  giftBtn: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  giftIcon: {
    fontSize: 18,
  },
  giftPrice: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
    marginTop: 2,
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sendButton: {
    backgroundColor: '#EA4C89',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
  floatingChatBtn: {
    position: 'absolute',
    bottom: 86,
    right: 14,
    backgroundColor: '#ffffffee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingHomeBtn: {
    position: 'absolute',
    bottom: 86,
    left: 14,
    backgroundColor: '#ffffffee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  voiceControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  messageContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#FFF9D6',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    color: '#6A5A00',
  },
});