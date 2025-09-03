import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useHandRaise(roomId: string, userId: string) {
  const raise = useCallback(async () => {
    await supabase.from('room_participants').update({ hand_raised: true }).eq('room_id', roomId).eq('user_id', userId);
  }, [roomId, userId]);
  const lower = useCallback(async () => {
    await supabase.from('room_participants').update({ hand_raised: false }).eq('room_id', roomId).eq('user_id', userId);
  }, [roomId, userId]);
  return { raise, lower };
}




