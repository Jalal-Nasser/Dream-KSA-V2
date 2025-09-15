// src/components/chat/ChatPane.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, FlatList, KeyboardAvoidingView, Platform, StyleSheet, I18nManager
} from 'react-native'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'
import { fetchRecentMessages, subscribeMessages, sendMessage, getSessionUser, type Message } from '../../lib/chat'
import { getSupabase } from '../../../lib/supabase'

type Props = {
  roomId: string
  onClose?: () => void
}

export default function ChatPane({ roomId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    getSessionUser().then(u => setUserId(u.userId)).catch(() => setUserId(null))
    let cancel = () => {}
    ;(async () => {
      const initial = await fetchRecentMessages(roomId)
      setMessages(initial)
      // subscribe to realtime changes
      const supabase = getSupabase();
      const channel = supabase
        .channel(`room:${roomId}:messages`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newMessage = payload.new as Message;
                setMessages(prev => [...prev, newMessage]);
                requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
              }
            })
        .subscribe();
      
      cancel = () => supabase.removeChannel(channel);
    })()
    return () => cancel()
  }, [roomId])

  const mine = (m: Message) => userId && m.user_id === userId

  // Basic cache for names from profiles (best-effort)
  const [nameCache, setNameCache] = useState<Record<string, string>>({})
  const getName = async (uid: string) => {
    if (nameCache[uid]) return nameCache[uid]
    const supabase = getSupabase()
    const { data } = await supabase.from('profiles').select('display_name, username').eq('id', uid).maybeSingle()
    const nm = data?.display_name || data?.username || (uid?.slice(0, 6) ?? 'مستخدم')
    setNameCache(prev => ({ ...prev, [uid]: nm }))
    return nm
  }

  useEffect(() => {
    // warm cache for recent senders
    const ids = Array.from(new Set(messages.map(m => m.user_id))).slice(-8)
    ids.forEach(id => getName(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  const renderItem = ({ item }: { item: Message }) => (
    <MessageBubble
      text={item.content}
      mine={mine(item)}
      name={mine(item) ? undefined : (nameCache[item.user_id] || undefined)}
      time={new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.created_at))}
    />
  )

  const onSend = async () => {
    if (!text.trim() || sending) return;
    
    setSending(true);
    try {
      const messageText = text.trim();
      setText(''); // Clear input immediately
      
      // Send to Supabase
      const supabase = getSupabase();
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        content: messageText,
      });
      
      if (error) throw error;
      
      // Scroll to bottom after sending
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e: any) {
      console.warn('[chat] send failed', e?.message || e);
      // Restore text on error
      setText(text);
    } finally {
      setSending(false);
    }
  }

  const dir = I18nManager.isRTL ? 'row-reverse' : 'row'
  return (
    <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header with close button */}
      <View style={[styles.header, { flexDirection: dir }]}>
        <Text style={styles.headerTitle}>الدردشة</Text>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(m) => m.id?.toString?.() ?? Math.random().toString(36)}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.composerWrap}>
        <InputBar
          value={text}
          onChangeText={setText}
          onSend={onSend}
          disabled={sending}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F8E8F0', direction: 'rtl' as const },
  header: { 
    paddingHorizontal: 16, paddingVertical: 12, 
    backgroundColor: '#F5D1E0', borderBottomWidth: 1, borderBottomColor: '#E8B5C7',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2f2136', flex: 1, textAlign: 'center' },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 18, color: '#8f7d93' },
  listContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 90 },
  composerWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10,
    backgroundColor: '#F5D1E0',
    borderTopWidth: 1, borderTopColor: '#E8B5C7'
  },
})
