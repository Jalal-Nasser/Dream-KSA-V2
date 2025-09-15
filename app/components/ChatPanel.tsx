import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, I18nManager, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { DEMO_MODE } from '../lib/demoMode';

type Props = {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  meUserId?: string;
  backendBase?: string;
};

type Msg = { id: string; room_id?: string; user_id?: string | null; text?: string; ts?: number; from?: string; at?: number };

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
  const timerRef = useRef<any>(null);
  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!visible) return;

    if (DEMO_MODE) {
      const tick = async () => {
        try {
          const res = await fetch(`${base}/rooms/${encodeURIComponent(roomId)}/messages`);
          const j = await res.json();
          if (j?.ok && Array.isArray(j.messages)) setMsgs(j.messages);
        } catch {}
      };
      tick();
      timerRef.current = setInterval(tick, 2000);
      return () => { if (timerRef.current) clearInterval(timerRef.current as any); };
    } else {
      // Supabase Realtime channel-based chat
      const channel = supabase.channel(`room:${roomId}`, { config: { broadcast: { self: true }, presence: { key: (meUserId || 'me') as string } } });
      chanRef.current = channel as any;
      channel.on('broadcast', { event: 'message' }, (payload: any) => {
        const p = payload?.payload || payload;
        const m: Msg = { id: p?.id, text: p?.text, from: p?.from, at: p?.at };
        setMsgs((prev) => [...prev, m].slice(-200));
      });
      channel.subscribe();
      // optional: initial pull from DB if available
      (async () => {
        try {
          const { data } = await supabase
            .from('messages')
            .select('id,room_id,user_id,content,created_at')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })
            .limit(100);
          const mapped: Msg[] = (data || []).map((r: any) => ({ id: r.id, room_id: r.room_id, user_id: r.user_id, text: r.content, ts: new Date(r.created_at).getTime() }));
          if (mapped.length) setMsgs(mapped);
        } catch {}
      })();
      return () => {
        if (chanRef.current) supabase.removeChannel(chanRef.current as any);
        chanRef.current = null;
      };
    }
  }, [visible, roomId, base, meUserId]);

  const send = async () => {
    const v = String(text || '').trim();
    if (!v) return;
    setText('');
    try {
      if (DEMO_MODE) {
        await fetch(`${base}/rooms/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: roomId, user_id: meUserId, text: v }),
        });
      } else {
        // Broadcast to channel for realtime
        const msg = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`, from: (AR ? 'أنا' : 'Me'), text: v, at: Date.now() };
        try { await chanRef.current?.send({ type: 'broadcast', event: 'message', payload: msg }); } catch {}
        // Persist best-effort
        try { await supabase.from('messages').insert({ room_id: roomId, user_id: meUserId, content: v }); } catch {}
      }
    } catch {}
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
    } catch {}
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill as any} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{AR ? 'الدردشة' : 'Chat'}</Text>
          <Pressable onPress={onClose} hitSlop={10}><Text style={styles.close}>✕</Text></Pressable>
        </View>

        <FlatList
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
          renderItem={({ item }) => {
            const mine = item.user_id && item.user_id === meUserId;
            const system = item.user_id == null;
            return (
              <View style={[
                styles.msgRow,
                system ? styles.center : (mine ? (AR ? styles.left : styles.right) : (AR ? styles.right : styles.left)),
              ]}>
                <View style={[styles.bubble, system ? styles.sysBubble : (mine ? styles.meBubble : styles.otherBubble)]}>
                  <Text style={[styles.msgText, system && styles.sysText as any]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.giftsRow}>
          {gifts.map(g => (
            <Pressable key={g.id} onPress={() => sendGift(g.id)} style={styles.giftBtn}>
              <Text style={styles.giftTxt}>{g.label}</Text>
              <Text style={styles.giftPrice}>{g.price}</Text>
            </Pressable>
          ))}
          <View style={{ flex: 1 }} />
          {balance != null && <Text style={styles.balance}>{AR ? `الرصيد: ${balance}` : `Coins: ${balance}`}</Text>}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={AR ? 'اكتب رسالة…' : 'Type a message…'}
            placeholderTextColor="#888"
            style={[styles.input, AR ? styles.inputRTL : styles.inputLTR]}
            textAlign={AR ? 'right' : 'left'}
          />
          <Pressable onPress={send} style={styles.sendBtn}><Text style={styles.sendTxt}>{AR ? 'إرسال' : 'Send'}</Text></Pressable>
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
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: '#222', textAlign: AR ? 'right' : 'left' },
  close: { fontSize: 18, color: '#999', padding: 6 },
  msgRow: { marginVertical: 4, width: '100%' },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  center: { alignItems: 'center' },
  bubble: { maxWidth: '85%', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14 },
  meBubble: { backgroundColor: '#E8D8F9' },
  otherBubble: { backgroundColor: '#F1F1F1' },
  sysBubble: { backgroundColor: '#FFF9D6' },
  msgText: { fontSize: 14, color: '#222' },
  sysText: { color: '#6A5A00' },
  giftsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 4 },
  giftBtn: { backgroundColor: '#FAFAFA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 4, borderWidth: 1, borderColor: '#eee' },
  giftTxt: { fontSize: 18 },
  giftPrice: { fontSize: 11, color: '#777', textAlign: 'center' },
  balance: { fontSize: 12, color: '#555', paddingHorizontal: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  input: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, fontSize: 14, borderWidth: 1, borderColor: '#eee' },
  inputRTL: { marginLeft: 8 }, inputLTR: { marginRight: 8 },
  sendBtn: { backgroundColor: '#EA4C89', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  sendTxt: { color: '#fff', fontWeight: '700' },
});


