import { useState, useCallback } from 'react';
import { getSupabase } from '../../lib/supabase';

export type JoinResult = {
  status: 'ok' | 'fail';
  message?: string;
  membership?: {
    room_id: string;
    user_id: string;
    role: string;
  };
};

export function useJoinRoom() {
  const [isJoining, setIsJoining] = useState(false);

  const tryJoin = useCallback(async (
    roomId: string, 
    role: 'host' | 'speaker' | 'listener' = 'listener'
  ): Promise<JoinResult> => {
    setIsJoining(true);
    
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { status: 'fail', message: 'يجب تسجيل الدخول أولاً' };
      }

      const response = await fetch('https://api.dreamsksa.online/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          room_id: roomId,
          user_id: user.id,
          role: role,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        return { 
          status: 'fail', 
          message: result.message || `فشل في الانضمام للغرفة (${response.status})` 
        };
      }

      return {
        status: 'ok',
        membership: {
          room_id: roomId,
          user_id: user.id,
          role: result.data?.role || role,
        }
      };

    } catch (error: any) {
      console.warn('[useJoinRoom] join failed:', error);
      return { 
        status: 'fail', 
        message: error.message || 'خطأ في الشبكة' 
      };
    } finally {
      setIsJoining(false);
    }
  }, []);

  return {
    tryJoin,
    isJoining,
  };
}
