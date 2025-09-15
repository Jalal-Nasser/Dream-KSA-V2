// src/components/chat/ChatPane.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, FlatList, KeyboardAvoidingView, Platform, StyleSheet, I18nManager, Pressable
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'
import { fetchRecentMessages, subscribeMessages, sendMessage, getSessionUser, type Message } from '../../lib/chat'
import { getSupabase } from '../../../lib/supabase'
import { subscribeChat, broadcastChat, type ChatMessage } from '../../../lib/chatRealtime'
import { primeProfiles, getName, getAvatar } from '../../../lib/profileCache'

type Props = {
  roomId: string
  onClose?: () => void
}

export default function ChatPane({ roomId, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    getSessionUser().then(u => setUserId(u.userId)).catch(() => setUserId(null))
    
    // Initialize chat with real-time subscriptions
    const initializeChat = async () => {
      try {
        // Fetch initial messages
        const initial = await fetchRecentMessages(roomId)
        const chatMessages: ChatMessage[] = initial.map(msg => ({
          ...msg,
          author_name: undefined // Will be populated by profile cache
        }))
        setMessages(chatMessages)
        
        // Prime profile cache with all user IDs from messages
        const userIds = Array.from(new Set(initial.map(m => m.user_id).filter(id => id && id !== 'null')))
        if (userIds.length > 0) {
          await primeProfiles(userIds)
        }
        
        // Subscribe to real-time chat events
        const { channel, unsubscribe } = subscribeChat(
          roomId,
          // Broadcast message (instant peer message)
          async (msg) => {
            // Fetch profile for the new message sender
            if (msg.user_id && msg.user_id !== 'null') {
              await primeProfiles([msg.user_id])
            }
            
            setMessages(prev => {
              // Avoid duplicates by checking if message already exists
              const exists = prev.some(m => m.id === msg.id)
              if (exists) return prev
              return [...prev, msg]
            })
            requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }))
          },
          // Database insert (authoritative history)
          (msg) => {
            setMessages(prev => {
              // Replace optimistic message with authoritative one if needed
              const existingIndex = prev.findIndex(m => m.id === msg.id)
              if (existingIndex >= 0) {
                const newMessages = [...prev]
                newMessages[existingIndex] = msg
                return newMessages
              }
              return [...prev, msg]
            })
            requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }))
          }
        )
        
        channelRef.current = channel
        return unsubscribe
      } catch (error) {
        console.warn('[chat] initialization failed:', error)
        return () => {}
      }
    }
    
    let cleanup: (() => void) | null = null
    initializeChat().then(unsubscribe => {
      cleanup = unsubscribe
    })
    
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [roomId])

  const mine = (m: ChatMessage) => Boolean(userId && m.user_id === userId)

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const displayName = mine(item) ? undefined : (item.author_name || getName(item.user_id))
    return (
      <MessageBubble
        text={item.content}
        mine={mine(item)}
        name={displayName}
        time={new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.created_at))}
      />
    )
  }

  const onSend = async () => {
    if (!text.trim() || sending || !userId) return;
    
    setSending(true);
    const messageText = text.trim();
    setText(''); // Clear input immediately
    
    try {
      const now = new Date().toISOString();
      const supabase = getSupabase();
      
      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        room_id: roomId,
        user_id: userId,
        content: messageText,
        created_at: now,
        author_name: getName(userId), // Use cached name
      };
      
      // 1) Add optimistic message immediately
      setMessages(prev => [...prev, optimisticMessage]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
      
      // 2) Broadcast for instant peer updates
      if (channelRef.current) {
        broadcastChat(channelRef.current, optimisticMessage);
      }
      
      // 3) Persist to database for history
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        user_id: userId,
        content: messageText,
      });
      
      if (error) {
        console.warn('[chat] database insert failed:', error);
        // Mark message as failed (could add retry UI here)
        setMessages(prev => 
          prev.map(m => 
            m.id === optimisticMessage.id 
              ? { ...m, id: 'failed-' + m.id } 
              : m
          )
        );
      }
    } catch (e: any) {
      console.warn('[chat] send failed', e?.message || e);
      // Restore text on error
      setText(messageText);
    } finally {
      setSending(false);
    }
  }

  const dir = I18nManager.isRTL ? 'row-reverse' : 'row'
  return (
    <LinearGradient
      colors={['#FFE3F0', '#F8E8F0', '#F5D1E0', '#FFB6C1']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.gradientContainer}
    >
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
          style={{ direction: 'rtl' }}
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
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  wrap: { 
    flex: 1, 
    backgroundColor: 'transparent', 
    direction: 'rtl' as const 
  },
  header: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: 'rgba(245, 209, 224, 0.9)', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(232, 181, 199, 0.8)',
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#2f2136', 
    flex: 1, 
    textAlign: 'center' 
  },
  closeBtn: { 
    padding: 8,
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { 
    fontSize: 18, 
    color: '#8f7d93',
    fontWeight: '600',
  },
  listContent: { 
    paddingHorizontal: 12, 
    paddingTop: 10, 
    paddingBottom: 90 
  },
  composerWrap: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(245, 209, 224, 0.95)',
    borderTopWidth: 1, 
    borderTopColor: 'rgba(232, 181, 199, 0.8)',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
})
