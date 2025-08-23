import { supabase } from '@/lib/supabase';
import type { MicStatus, MicRequestStatus, RoomParticipant } from './types';

const MAX_SPEAKERS = 2;

export async function raiseHand(user_id: string, room_id: string) {
  await supabase
    .from('mic_requests')
    .upsert({ user_id, room_id, status: 'pending' as MicRequestStatus }, { onConflict: 'user_id,room_id' });

  await supabase
    .from('room_participants')
    .upsert({ user_id, room_id, mic_status: 'requested' as MicStatus }, { onConflict: 'user_id,room_id' });
}

export async function cancelHand(user_id: string, room_id: string) {
  await supabase
    .from('mic_requests')
    .update({ status: 'cancelled' as MicRequestStatus })
    .eq('user_id', user_id)
    .eq('room_id', room_id);

  await supabase
    .from('room_participants')
    .upsert({ user_id, room_id, mic_status: 'none' as MicStatus }, { onConflict: 'user_id,room_id' });
}

export async function grantMic(admin_id: string, user_id: string, room_id: string) {
  const { data: speakers, error: speakersErr } = await supabase
    .from('room_participants')
    .select('user_id')
    .eq('room_id', room_id)
    .eq('mic_status', 'granted');

  if (speakersErr) throw speakersErr;
  if ((speakers?.length ?? 0) >= MAX_SPEAKERS) {
    throw new Error(`Speaker limit (${MAX_SPEAKERS}) reached`);
  }

  await supabase
    .from('mic_requests')
    .update({ status: 'approved' as MicRequestStatus })
    .eq('user_id', user_id)
    .eq('room_id', room_id);

  const { error } = await supabase
    .from('room_participants')
    .upsert({ user_id, room_id, mic_status: 'granted' as MicStatus }, { onConflict: 'user_id,room_id' });
  if (error) throw error;
}

export async function revokeMic(admin_id: string, user_id: string, room_id: string) {
  const { error } = await supabase
    .from('room_participants')
    .upsert({ user_id, room_id, mic_status: 'none' as MicStatus }, { onConflict: 'user_id,room_id' });
  if (error) throw error;
}

type Listener = {
  onParticipants?: (rows: RoomParticipant[]) => void;
  onRequests?: (rows: { user_id: string; room_id: string; status: MicRequestStatus }[]) => void;
};

export function listenRoom(room_id: string, listener: Listener) {
  (async () => {
    const [p, r] = await Promise.all([
      supabase.from('room_participants').select('*').eq('room_id', room_id),
      supabase.from('mic_requests').select('*').eq('room_id', room_id).eq('status', 'pending'),
    ]);

    if (!p.error && listener.onParticipants) listener.onParticipants(p.data as RoomParticipant[]);
    if (!r.error && listener.onRequests) listener.onRequests(r.data as any);
  })();

  const channel = supabase
    .channel(`room_${room_id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${room_id}` },
      async () => {
        const { data } = await supabase.from('room_participants').select('*').eq('room_id', room_id);
        listener.onParticipants?.((data || []) as RoomParticipant[]);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mic_requests', filter: `room_id=eq.${room_id}` },
      async () => {
        const { data } = await supabase
          .from('mic_requests')
          .select('*')
          .eq('room_id', room_id)
          .eq('status', 'pending');
        listener.onRequests?.((data || []) as any);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}





