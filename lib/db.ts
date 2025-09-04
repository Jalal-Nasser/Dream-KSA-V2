import { supabase } from './supabaseClient';

// Reusable record type for flexible update payloads (typed, not implicit any)
export type AnyPayload = Record<string, unknown>;

// ===== Rooms helpers (create/join/customize) =====
export type RoomInsert = {
  title: string;
  topic?: string | null;
  is_locked?: boolean | null;
  language?: string | null;
  max_participants?: number | null;
  banner_url?: string | null;
  description?: string | null;
};

export type RoomUpdate = Partial<RoomInsert> & {
  category?: string | null;
  region?: string | null;
};d

export type MicRequestRow = {
  id: string;
  room_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'denied' | 'revoked';
  created_at: string;
  updated_at: string;
  users?: { id: string; name?: string | null; username?: string | null; avatar_url?: string | null };
};

export async function getRoomParticipants(roomId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select('user_id, mic_status, users!inner(id, name, username, avatar_url)')
    .eq('room_id', roomId);
  if (error) throw error;
  return data || [];
}

export function watchMicRequests(
  roomId: string,
  handler: (rows: MicRequestRow[]) => void
) {
  const channel = supabase
    .channel(`mic:req:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mic_requests', filter: `room_id=eq.${roomId}` }, async () => {
      const rows = await fetchMicRequests(roomId);
      handler(rows);
    })
    .subscribe();

  // seed
  fetchMicRequests(roomId).then(handler).catch(() => {});

  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}

async function fetchMicRequests(roomId: string) {
  const { data, error } = await supabase
    .from('mic_requests')
    .select('id, room_id, user_id, status, created_at, updated_at, users!inner(id, name, username, avatar_url)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as MicRequestRow[];
}

export async function raiseHand(roomId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');
  // Prefer RPC if available
  const { error: rpcErr } = await supabase.rpc('raise_hand', { p_room: roomId, p_user: user.id });
  if (!rpcErr) return;
  // Fallback: direct upsert
  const { error } = await supabase
    .from('mic_requests')
    .upsert({ room_id: roomId, user_id: user.id, status: 'pending' }, { onConflict: 'room_id,user_id' });
  if (error) throw error;
  await supabase
    .from('room_participants')
    .update({ mic_status: 'requested' })
    .eq('room_id', roomId)
    .eq('user_id', user.id);
}

export async function cancelHand(roomId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('mic_requests')
    .update({ status: 'denied', updated_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .eq('status', 'pending');
  if (error) throw error;
  await supabase
    .from('room_participants')
    .update({ mic_status: 'none' })
    .eq('room_id', roomId)
    .eq('user_id', user.id);
}

export async function grantMic(roomId: string, targetUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');
  // Prefer server RPC (enforces host + cap=2)
  const { data, error } = await supabase.rpc('grant_mic', { p_room: roomId, p_user: targetUserId, p_admin: user.id });
  if (error) throw error;
  if (data && data !== 'ok') throw new Error(String(data));
}

export async function revokeMic(roomId: string, targetUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Not authenticated');
  const { data, error } = await supabase.rpc('revoke_mic', { p_room: roomId, p_user: targetUserId, p_admin: user.id });
  if (error) throw error;
  if (data && data !== 'ok') throw new Error(String(data));
}

export async function myParticipant(roomId: string) {
  return supabase
    .from('room_participants')
    .select('role, mic_status, user_id')
    .eq('room_id', roomId)
    .maybeSingle();
}

export function watchMyParticipant(roomId: string, userId: string, cb: (row: any) => void) {
  const ch = supabase
    .channel(`rp:${roomId}:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, (payload) => {
      if ((payload as any)?.new?.user_id === userId) cb((payload as any).new);
    })
    .subscribe();
  return () => supabase.removeChannel(ch);
}

export function watchMicQueue(roomId: string, cb: (rows: any[]) => void) {
  const refetch = async () => {
    const { data } = await supabase
      .from('mic_requests')
      .select('id, user_id, status, created_at, updated_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    cb(data || []);
  };
  const ch = supabase
    .channel(`mic:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mic_requests', filter: `room_id=eq.${roomId}` }, refetch)
    .subscribe();
  refetch();
  return () => supabase.removeChannel(ch);
}

export const joinRoom = async (roomId: string) => {
  const { error } = await supabase.rpc('join_room', { p_room: roomId });
  if (error) throw error;
};

export const createRoom = async (name: string) => {
  const { data, error } = await supabase.rpc('create_room', { p_name: name, p_agency_id: null });
  if (error) throw error;
  return data;
};

export async function createRoomTyped(payload: RoomInsert) {
  // host_id is set via trigger (auth.uid()) from our migration; client only sends room fields
  const { data, error } = await supabase
    .from('rooms')
    .insert(payload)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoom(roomId: string, payload: RoomUpdate) {
  const { data, error } = await supabase
    .from('rooms')
    .update(payload)
    .eq('id', roomId)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function joinRoomTyped(roomId: string) {
  // RLS allows inserting your own membership row
  const { data, error } = await supabase
    .from('room_participants')
    .insert({ room_id: roomId }) // user_id = auth.uid() enforced by policy
    .select('room_id, user_id')
    .single();
  if (error) throw error;
  return data;
}

export async function leaveRoom(roomId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .delete()
    .eq('room_id', roomId)
    .select('room_id')
    .single();
  if (error) throw error;
  return data;
}

// Example: safe generic upsert helper with typed payload
export async function upsertProfile(payload: AnyPayload) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}


