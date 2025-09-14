import { supabase } from '@/lib/supabase';

export type ParticipantRow = {
  room_id: string;
  user_id: string;
  role: 'host' | 'owner' | 'speaker' | 'listener';
  joined_at: string;
};

export function subscribeParticipants(roomId: string, onRows: (rows: ParticipantRow[]) => void) {
  // initial fetch
  supabase
    .from('room_participants')
    .select('room_id,user_id,role,joined_at')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: false })
    .then(({ data }) => onRows((data || []) as ParticipantRow[]));

  // realtime channel
  const channel = supabase
    .channel(`room_participants:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` },
      async () => {
        const { data } = await supabase
          .from('room_participants')
          .select('room_id,user_id,role,joined_at')
          .eq('room_id', roomId)
          .order('joined_at', { ascending: false });
        onRows((data || []) as ParticipantRow[]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export type MessageRow = {
  id: string;
  room_id: string;
  user_id: string;
  text: string;
  created_at: string;
};

export function subscribeMessages(roomId: string, onRows: (rows: MessageRow[]) => void) {
  supabase
    .from('messages')
    .select('id,room_id,user_id,text,created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .then(({ data }) => onRows((data || []) as MessageRow[]));

  const channel = supabase
    .channel(`messages:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, async () => {
      const { data } = await supabase
        .from('messages')
        .select('id,room_id,user_id,text,created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      onRows((data || []) as MessageRow[]);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function sendMessage(roomId: string, userId: string, text: string) {
  if (!text?.trim()) return;
  await supabase.from('messages').insert({ room_id: roomId, user_id: userId, text: text.trim() });
}
