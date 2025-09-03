import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useGiftsLive(roomId?: string, hostId?: string) {
  const [gifts, setGifts] = useState<any[]>([]);
  useEffect(() => {
    if (!roomId) return;
    supabase.from('gifts').select('*').eq('room_id', roomId).order('created_at', { ascending: false }).limit(100).then(({ data }) => setGifts(data || []));
    const channel = supabase.channel(`gifts:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts', filter: `room_id=eq.${roomId}` }, (payload) => {
        setGifts((prev) => [payload.new as any, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);
  return { gifts };
}




