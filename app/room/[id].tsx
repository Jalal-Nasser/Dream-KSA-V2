import * as React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';

type Msg = { id: string; from: string; text: string; at: number };
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

export default function RoomChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const chanRef = React.useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');
  const [peers, setPeers] = React.useState<string[]>([]);

  React.useEffect(() => {
    let mounted = true;
    const channel = supabase.channel(`room:${id}`, {
      config: { broadcast: { self: true }, presence: { key: uid() } }
    });
    chanRef.current = channel;

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
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username: user?.email || user?.id?.slice(0, 6) || 'ضيف' });
        }
      });
    })();

    return () => {
      mounted = false;
      if (chanRef.current) supabase.removeChannel(chanRef.current);
      chanRef.current = null;
    };
  }, [id]);

  const send = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const msg: Msg = { id: uid(), from: user?.email || user?.id?.slice(0,6) || 'أنا', text: text.trim(), at: Date.now() };
    if (!msg.text) return;
    setText('');
    await chanRef.current?.send({ type: 'broadcast', event: 'message', payload: msg });
    supabase.from('messages').insert({ room_id: id, user_id: user?.id, content: msg.text }).catch(()=>{});
  };

  return (
    <View style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-forward" size={22} color={PALETTE.primaryDark} /></Pressable>
        <Text style={styles.title}>غرفة دردشة</Text>
        <View style={{ minWidth:22, alignItems:'flex-end' }}><Text style={styles.badge}>{peers.length}</Text></View>
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
    </View>
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
