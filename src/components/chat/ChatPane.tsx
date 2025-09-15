// src/components/chat/ChatPane.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, FlatList, KeyboardAvoidingView, Platform, TextInput, Pressable, StyleSheet, I18nManager
} from 'react-native'
import MessageBubble from './MessageBubble'
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
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    getSessionUser().then(u => setUserId(u.userId)).catch(() => setUserId(null))
    let cancel = () => {}
    ;(async () => {
      const initial = await fetchRecentMessages(roomId)
      setMessages(initial)
      // subscribe
      cancel = subscribeMessages(roomId, (m) => {
        setMessages(prev => [...prev, m])
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }))
      })
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
    try {
      const t = text
      setText('')
      await sendMessage(roomId, t)
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }))
    } catch (e: any) {
      setText((prev) => prev || '') // keep input
      console.warn('[chat] send failed', e?.message || e)
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
      <View style={[styles.composerWrap, { flexDirection: dir }]}>
        <TextInput
          style={styles.input}
          placeholder="اكتب رسالة…"
          placeholderTextColor="#bfa9c6"
          value={text}
          onChangeText={setText}
          multiline
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />
        <Pressable style={styles.sendBtn} onPress={onSend}>
          <Text style={styles.sendTxt}>إرسال</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFF9FC', direction: 'rtl' as const },
  header: { 
    paddingHorizontal: 16, paddingVertical: 12, 
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0E3EB',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2f2136', flex: 1, textAlign: 'center' },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 18, color: '#8f7d93' },
  listContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 90 },
  composerWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10, gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#F0E3EB'
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0D6E3',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, color: '#2f2136',
  },
  sendBtn: {
    paddingHorizontal: 16, height: 44, borderRadius: 14,
    backgroundColor: '#EB3B85', alignItems: 'center', justifyContent: 'center'
  },
  sendTxt: { color: '#fff', fontWeight: '700' },
})
