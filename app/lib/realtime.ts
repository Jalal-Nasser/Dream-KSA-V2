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


