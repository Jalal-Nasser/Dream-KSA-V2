import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, I18nManager, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { DEMO_MODE } from '../lib/demoMode';
import { getSupabase } from '../../lib/supabase';

type Props = {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  meUserId?: string;
  backendBase?: string; // optional override
};

type Msg = { id: string; room_id: string; user_id: string | null; text: string; ts: number };

const AR = I18nManager.isRTL;

const gifts = [
  { id: 'rose', label: '🌹', price: 50 },
  { id: 'heart', label: '❤️', price: 100 },
  { id: 'car', label: '🏎️', price: 500 },
  { id: 'yacht', label: '🛥️', price: 2000 },
];

export default function ChatPanel({ visible, onClose, roomId, meUserId = 'me', backendBase }: Props) {
  const base = useMemo(() => backendBase || (process.env.EXPO_PUBLIC_BACKEND_URL || 'https://api.dreamsksa.online'), [backendBase]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const supabase = getSupabase();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!visible) return;

    if (DEMO_MODE) {
      // simple polling for demo mode
      const tick = async () => {
        try {
          const res = await fetch(`${base}/rooms/${encodeURIComponent(roomId)}/messages`);
          const j = await res.json();
          if (j?.ok && Array.isArray(j.messages)) setMsgs(j.messages);
        } catch (e) {
          // noop
        }
      };
      tick();
      timerRef.current = setInterval(tick, 2000);
    } else {
      // Supabase Realtime for live mode
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      channelRef.current = supabase.channel(`room:${roomId}`);
      channelRef.current.on('broadcast', { event: 'message' }, (payload: { payload: Msg }) => {
        setMsgs((prev) => [...prev, payload.payload].slice(-200));
      }).subscribe();

      // Initial fetch for existing messages
      supabase.from('messages')
        .select('id,room_id,user_id,text,created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) {
            setMsgs(data.map(m => ({ ...m, ts: new Date(m.created_at).getTime() })));
          }
        });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current as any);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [visible, roomId, base, supabase]);

  const send = async () => {
    const v = String(text || '').trim();
    if (!v) return;
    setText('');

    if (DEMO_MODE) {
      try {
        await fetch(`${base}/rooms/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: roomId, user_id: meUserId, text: v }),
        });
      } catch (e) {}
    } else {
      try {
        const msg: Msg = { id: String(Date.now()), room_id: roomId, user_id: meUserId, text: v, ts: Date.now() };
        await channelRef.current?.send({ type: 'broadcast', event: 'message', payload: msg });
        await supabase.from('messages').insert({ room_id: roomId, user_id: meUserId, content: v });
      } catch (e) {
        console.error('Supabase chat send failed:', e);
      }
    }
  };

  const sendGift = async (giftId: string) => {
    try {
      const res = await fetch(`${base}/rooms/gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, from_user_id: meUserId, to_user_id: null, gift_id: giftId }),
      });
      const j = await res.json();
      if (j?.ok && typeof j.balance === 'number') setBalance(j.balance);
    } catch (e) {}
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill as any} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Binmo-style Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chat</Text>
          <Pressable onPress={onClose} hitSlop={10}><Text style={styles.close}>✕</Text></Pressable>
        </View>

        {/* Gift Buttons Row - Binmo Style */}
        <View style={styles.giftsRow}>
          {gifts.map(g => (
            <Pressable key={g.id} onPress={() => sendGift(g.id)} style={styles.giftBtn}>
              <Text style={styles.giftTxt}>{g.label}</Text>
              <Text style={styles.giftPrice}>{g.price}</Text>
            </Pressable>
          ))}
        </View>

        {/* Emoji Row */}
        <View style={styles.emojiRow}>
          {['😀', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💯'].map((emoji) => (
            <Pressable key={emoji} onPress={() => setText(prev => prev + emoji)} style={styles.emojiBtn}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>

        {/* Message Input - Binmo Style */}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            style={styles.input}
            textAlign="left"
          />
          <Pressable onPress={send} style={styles.sendBtn}>
            <Text style={styles.sendTxt}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 50 },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
    maxHeight: '60%',
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 4 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: '#222', textAlign: 'left' },
  close: { fontSize: 18, color: '#999', padding: 6 },
  giftsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 4, gap: 8 },
  giftBtn: { backgroundColor: '#FAFAFA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  giftTxt: { fontSize: 18 },
  giftPrice: { fontSize: 11, color: '#777', textAlign: 'center', marginTop: 2 },
  emojiRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 4, gap: 8 },
  emojiBtn: { padding: 8, backgroundColor: '#f8f9fa', borderRadius: 8 },
  emojiText: { fontSize: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  input: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, fontSize: 14, borderWidth: 1, borderColor: '#eee' },
  sendBtn: { backgroundColor: '#EA4C89', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  sendTxt: { color: '#fff', fontWeight: '700' },
});