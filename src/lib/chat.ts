// src/lib/chat.ts
// NOTE: adjust import path if your client isn't at lib/supabase
import { getSupabase } from '../../lib/supabase'

export type Message = {
  id: string
  room_id: string
  user_id: string
  content: string
  created_at: string
}

export async function getSessionUser() {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  if (!data?.session) throw new Error('auth/missing')
  return { token: data.session.access_token, userId: data.session.user.id }
}

export async function fetchRecentMessages(roomId: string, limit = 100) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).reverse() as Message[]
}

export function subscribeMessages(roomId: string, onInsert: (m: Message) => void) {
  const supabase = getSupabase()
  const channel = supabase
    .channel(`room-messages-${roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
      (payload) => {
        onInsert(payload.new as Message)
      }
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export async function sendMessage(roomId: string, text: string) {
  const supabase = getSupabase()
  const { userId } = await getSessionUser()
  const trimmed = text.trim()
  if (!trimmed) return
  const { error } = await supabase.from('messages').insert({
    room_id: roomId,
    user_id: userId,
    content: trimmed,
  })
  if (error) throw error
}
