import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const RevokeMicSchema = z.object({
  room_id: z.string().uuid(),
  target_user_id: z.string().uuid()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonErr('Method Not Allowed', 405);
  }

  try {
    // Verify user authentication
    const user = await getUserFromReq(req);
    
    // Parse request body
    const body = await req.json();
    const { room_id, target_user_id } = RevokeMicSchema.parse(body);
    
    // Verify caller is room admin of the room
    const { data: callerParticipant, error: callerError } = await adminClient()
      .from('room_participants')
      .select('id, role')
      .eq('room_id', room_id)
      .eq('user_id', user.id)
      .single();
      
    if (callerError || !callerParticipant) {
      return jsonErr('You must be in the room to revoke mic access');
    }
    
    if (callerParticipant.role !== 'room_admin') {
      return jsonErr('Only room admins can revoke mic access');
    }
    
    // Get room details
    const { data: room, error: roomError } = await adminClient()
      .from('rooms')
      .select('id, name, current_speakers')
      .eq('id', room_id)
      .single();
      
    if (roomError || !room) {
      return jsonErr('Room not found');
    }
    
    // Get target user's current participant status
    const { data: targetParticipant, error: targetError } = await adminClient()
      .from('room_participants')
      .select('id, role, mic_granted')
      .eq('room_id', room_id)
      .eq('user_id', target_user_id)
      .single();
      
    if (targetError || !targetParticipant) {
      return jsonErr('Target user is not in the room');
    }
    
    if (!targetParticipant.mic_granted) {
      return jsonErr('User does not have mic access to revoke');
    }
    
    // Update target user's role and mic status
    const { error: updateError } = await adminClient()
      .from('room_participants')
      .update({
        role: 'listener',
        mic_granted: false
      })
      .eq('id', targetParticipant.id);
      
    if (updateError) {
      return jsonErr('Failed to revoke mic access');
    }
    
    // Update room speaker count if they were a speaker
    if (targetParticipant.role === 'speaker') {
      await adminClient()
        .from('rooms')
        .update({ current_speakers: Math.max(0, room.current_speakers - 1) })
        .eq('id', room_id);
    }
    
    return jsonOK({
      message: 'Microphone access revoked successfully',
      room_id,
      target_user_id,
      new_role: 'listener',
      current_speakers: targetParticipant.role === 'speaker' ? Math.max(0, room.current_speakers - 1) : room.current_speakers
    });
    
  } catch (error) {
    console.error('Revoke mic error:', error);
    return jsonErr(error.message || 'Failed to revoke mic access');
  }
});

