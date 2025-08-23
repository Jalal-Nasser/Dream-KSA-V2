import { supabase } from './supabase';

type MicStatus = 'none' | 'requested' | 'granted';

function ok<T>(data: T) { return { ok: true as const, data }; }
function err(code: string, message?: string) { return { ok: false as const, error: { code, message } }; }

export async function raiseHand(roomId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return err('AUTH');

    // Upsert pending mic request
    const { error: upErr } = await supabase
      .from('mic_requests')
      .insert({ room_id: roomId, user_id: user.id, status: 'pending' })
      .select()
      .limit(1);
    if (upErr) return err('NETWORK', upErr.message);

    // Update participant mic status -> requested
    const { error: stErr } = await supabase
      .from('room_participants')
      .update({ mic_status: 'requested' satisfies MicStatus })
      .eq('room_id', roomId)
      .eq('user_id', user.id);
    if (stErr) return err('NETWORK', stErr.message);

    return ok(true);
  } catch (e: any) {
    return err('NETWORK', e?.message || String(e));
  }
}

export async function cancelHand(roomId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return err('AUTH');

    // Mark latest pending request denied by user
    const { data: reqs } = await supabase
      .from('mic_requests')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    const latest = reqs?.[0];
    if (latest) {
      await supabase.from('mic_requests').update({ status: 'denied' }).eq('id', latest.id);
    }

    // Reset status
    const { error: stErr } = await supabase
      .from('room_participants')
      .update({ mic_status: 'none' satisfies MicStatus })
      .eq('room_id', roomId)
      .eq('user_id', user.id);
    if (stErr) return err('NETWORK', stErr.message);
    return ok(true);
  } catch (e: any) {
    return err('NETWORK', e?.message || String(e));
  }
}

export async function approveHand(roomId: string, userId: string) {
  try {
    // Limit to 2 speakers
    const { count, error: cErr } = await supabase
      .from('room_participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('mic_status', 'granted');
    if (cErr) return err('NETWORK', cErr.message);
    if ((count || 0) >= 2) return err('MIC_FULL');

    // Approve latest pending request for user
    const { data: reqs } = await supabase
      .from('mic_requests')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    const latest = reqs?.[0];
    if (latest) {
      await supabase.from('mic_requests').update({ status: 'approved' }).eq('id', latest.id);
    }

    // Grant mic
    const { error: stErr } = await supabase
      .from('room_participants')
      .update({ mic_status: 'granted' satisfies MicStatus })
      .eq('room_id', roomId)
      .eq('user_id', userId);
    if (stErr) return err('NETWORK', stErr.message);

    return ok(true);
  } catch (e: any) {
    return err('NETWORK', e?.message || String(e));
  }
}

export async function denyHand(roomId: string, userId: string) {
  try {
    // Deny latest pending request
    const { data: reqs } = await supabase
      .from('mic_requests')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    const latest = reqs?.[0];
    if (latest) {
      await supabase.from('mic_requests').update({ status: 'denied' }).eq('id', latest.id);
    }

    // Reset status
    const { error: stErr } = await supabase
      .from('room_participants')
      .update({ mic_status: 'none' satisfies MicStatus })
      .eq('room_id', roomId)
      .eq('user_id', userId);
    if (stErr) return err('NETWORK', stErr.message);

    return ok(true);
  } catch (e: any) {
    return err('NETWORK', e?.message || String(e));
  }
}

export async function revokeMic(roomId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('room_participants')
      .update({ mic_status: 'none' satisfies MicStatus })
      .eq('room_id', roomId)
      .eq('user_id', userId);
    if (error) return err('NETWORK', error.message);
    return ok(true);
  } catch (e: any) {
    return err('NETWORK', e?.message || String(e));
  }
}





