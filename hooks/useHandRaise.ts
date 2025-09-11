import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useHandRaise(roomId: string, userId: string) {
  const raise = useCallback(async () => {
    await supabase.from('hand_raises').insert({ room_id: roomId, user_id: userId, state: 'raised' });
  }, [roomId, userId]);
  const lower = useCallback(async () => {
    await supabase.from('hand_raises').update({ state: 'lowered' }).eq('room_id', roomId).eq('user_id', userId);
  }, [roomId, userId]);
  return { raise, lower };
}




