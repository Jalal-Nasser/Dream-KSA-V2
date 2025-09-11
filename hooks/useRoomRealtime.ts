import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useRoomRealtime(roomId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [hands, setHands] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ms = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at');
      if (!ms.error && mounted) setMessages(ms.data ?? []);
      const hs = await supabase
        .from('hand_raises')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at');
      if (!hs.error && mounted) setHands(hs.data ?? []);
    })();
    const ch = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (p: any) => setMessages((prev) => [...prev, p.new])
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hand_raises', filter: `room_id=eq.${roomId}` },
        (p: any) => setHands((prev) => [...prev, p.new])
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [roomId]);

  const sendMessage = async (body: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !body.trim()) return;
    await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: user.id, body: body.trim() });
  };

  const raiseHand = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('hand_raises')
      .insert({ room_id: roomId, user_id: user.id, state: 'raised' });
  };

  return { messages, hands, sendMessage, raiseHand };
}


