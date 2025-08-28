import { supabase } from '@/supabase';
const TABLE = 'mic_requests';

export async function raiseHand(roomId: string) {
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr) throw uerr; if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from(TABLE).insert({ room_id: roomId, user_id: user.id, status: 'pending' });
  if (error) throw error; return true;
}
export async function cancelHand(roomId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from(TABLE).delete().eq('room_id', roomId).eq('user_id', user.id).neq('status','approved');
  if (error) throw error; return true;
}
export async function approveMic(roomId: string, userId: string) {
  const { error } = await supabase.from(TABLE).update({ status:'approved' }).eq('room_id', roomId).eq('user_id', userId);
  if (error) throw error; return true;
}

// Alias for backward compatibility
export const grantMic = approveMic;
export async function revokeMic(roomId: string, userId: string) {
  const { error } = await supabase.from(TABLE).update({ status:'revoked' }).eq('room_id', roomId).eq('user_id', userId);
  if (error) throw error; return true;
}

export async function listenRoom(roomId: string, callbacks: {
  onParticipants?: () => void;
  onRequests?: () => void;
}) {
  // Placeholder implementation - you can expand this based on your needs
  const { onParticipants, onRequests } = callbacks;
  
  // Return a cleanup function
  return () => {
    // Cleanup logic here
  };
}
