import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, I18nManager, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export type ChatMsg = { id: string; userId: string | null; name?: string; text: string; ts: number };
type Props = {
  roomId: string;
  meUserId: string;
  meName?: string;
  onSend?: (text: string) => void;
  onGift?: (giftId: string) => void;
  demo?: boolean;
};

const gifts = [
  { id: 'rose', icon: '🌹' },
  { id: 'heart', icon: '❤️' },
  { id: 'car', icon: '🏎️' },
  { id: 'yacht', icon: '🛥️' },
];

const store: Record<string, ChatMsg[]> = {};

export default function InlineChat({ roomId, meUserId, meName, onSend, onGift, demo = true }: Props) {
  const [text, setText] = useState('');
  const [data, setData] = useState<ChatMsg[]>([]);
  const listRef = useRef<FlatList<ChatMsg>>(null);

  const pushLocal = (m: ChatMsg) => {
    if (!store[roomId]) store[roomId] = [];
    store[roomId].push(m);
    setData([...store[roomId]]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  useEffect(() => {
    if (!store[roomId]) {
      store[roomId] = [
        { id: 'sys-1', userId: null, text: 'مرحبًا بكم في الغرفة ✨', ts: Date.now() - 4000 },
      ];
    }
    setData([...store[roomId]]);
  }, [roomId]);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    setText('');
    const msg: ChatMsg = { id: `${Date.now()}`, userId: meUserId, name: meName || meUserId.slice(0, 6), text: v, ts: Date.now() };
    if (demo || !onSend) pushLocal(msg); else onSend(v);
  };

  const gift = (giftId: string) => {
    const msg: ChatMsg = {
      id: `gift-${Date.now()}`, userId: null, text: `${meName || 'ضيف'} أرسل هدية ${gifts.find(g => g.id === giftId)?.icon ?? '🎁'}`, ts: Date.now(),
    };
    if (demo || !onGift) pushLocal(msg); else onGift(giftId);
  };

  const AR = I18nManager.isRTL;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={cs.wrap}>
      <View style={cs.panel}>
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => {
            const mine = item.userId === meUserId && item.userId !== null;
            const sys = item.userId === null;
            return (
              <View style={[
                cs.row,
                sys ? cs.center : (mine ? (AR ? cs.left : cs.right) : (AR ? cs.right : cs.left)),
              ]}>
                <View style={[cs.bubble, sys ? cs.sys : (mine ? cs.me : cs.other)]}>
                  {!sys && <Text style={cs.name}>{item.name}</Text>}
                  <Text style={cs.text}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={cs.gifts}>
          {gifts.map(g => (
            <Pressable key={g.id} onPress={() => gift(g.id)} style={cs.gift}><Text style={{ fontSize: 18 }}>{g.icon}</Text></Pressable>
          ))}
        </View>

        <View style={cs.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={AR ? 'اكتب رسالة…' : 'Type a message…'}
            placeholderTextColor="#888"
            style={[cs.input, { textAlign: AR ? 'right' : 'left' }]}
          />
          <Pressable onPress={send} style={cs.send}><Text style={cs.sendTxt}>{AR ? 'إرسال' : 'Send'}</Text></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const cs = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25 },
  panel: {
    marginHorizontal: 8, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#eee',
  },
  row: { marginVertical: 4, width: '100%' },
  left: { alignItems: 'flex-start' }, right: { alignItems: 'flex-end' }, center: { alignItems: 'center' },
  bubble: { maxWidth: '88%', padding: 8, borderRadius: 12 },
  me: { backgroundColor: '#E9E1FF' }, other: { backgroundColor: '#F3F3F3' }, sys: { backgroundColor: '#FFF7D6' },
  name: { fontSize: 11, color: '#7B2BE2', marginBottom: 2 },
  text: { fontSize: 14, color: '#222' },
  gifts: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 6 },
  gift: { backgroundColor: '#FAFAFA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, borderWidth: 1, borderColor: '#eee' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  input: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, fontSize: 14, borderWidth: 1, borderColor: '#eee' },
  send: { backgroundColor: '#EA4C89', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginStart: 8 },
  sendTxt: { color: '#fff', fontWeight: '800' },
});
