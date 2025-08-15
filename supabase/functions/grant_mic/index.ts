import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const GrantMicSchema = z.object({
  room_id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.enum(['grant', 'revoke']),
  role: z.enum(['speaker', 'listener']).optional()
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
    const { room_id, user_id, action, role } = GrantMicSchema.parse(body);
    
    // Verify the room exists and get its details
    const { data: room, error: roomError } = await adminClient()
      .from('rooms')
      .select(`
        id,
        name,
        owner_id,
        max_speakers,
        current_speakers,
        is_live
      `)
      .eq('id', room_id)
      .eq('is_active', true)
      .single();
      
    if (roomError || !room) {
      return jsonErr('Room not found or inactive');
    }
    
    // Check if user is room owner or has admin privileges
    const { data: userProfile, error: profileError } = await adminClient()
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError || !userProfile) {
      return jsonErr('User profile not found');
    }
    
    const isRoomOwner = user.id === room.owner_id;
    const isAdmin = userProfile.role === 'admin';
    
    if (!isRoomOwner && !isAdmin) {
      return jsonErr('Only room owners or admins can manage microphone access');
    }
    
    // Get the target user's current participant status
    const { data: participant, error: participantError } = await adminClient()
      .from('room_participants')
      .select(`
        id,
        user_id,
        role,
        mic_granted,
        hand_raised
      `)
      .eq('room_id', room_id)
      .eq('user_id', user_id)
      .single();
      
    if (participantError || !participant) {
      return jsonErr('User is not a participant in this room');
    }
    
    let newRole = participant.role;
    let micGranted = participant.mic_granted;
    
    if (action === 'grant') {
      // Check if room can accommodate more speakers
      if (room.current_speakers >= room.max_speakers && participant.role !== 'speaker') {
        return jsonErr(`Room is at maximum speaker capacity (${room.max_speakers})`);
      }
      
      newRole = 'speaker';
      micGranted = true;
      
      // Update room speaker count if promoting to speaker
      if (participant.role !== 'speaker') {
        await adminClient()
          .from('rooms')
          .update({ current_speakers: room.current_speakers + 1 })
          .eq('id', room_id);
      }
    } else if (action === 'revoke') {
      newRole = 'listener';
      micGranted = false;
      
      // Update room speaker count if demoting from speaker
      if (participant.role === 'speaker') {
        await adminClient()
          .from('rooms')
          .update({ current_speakers: Math.max(0, room.current_speakers - 1) })
          .eq('id', room_id);
      }
    }
    
    // Update participant role and mic status
    const { data: updatedParticipant, error: updateError } = await adminClient()
      .from('room_participants')
      .update({
        role: newRole,
        mic_granted: micGranted,
        hand_raised: false // Reset hand raise when mic is granted/revoked
      })
      .eq('id', participant.id)
      .select()
      .single();
      
    if (updateError) {
      return jsonErr(`Failed to update participant: ${updateError.message}`);
    }
    
    // TODO: Send real-time notification to the user about mic status change
    // This would typically be done through Supabase Realtime
    
    return jsonOK({
      message: `Microphone ${action === 'grant' ? 'granted' : 'revoked'} successfully`,
      participant: updatedParticipant,
      room: {
        id: room.id,
        current_speakers: action === 'grant' && participant.role !== 'speaker' 
          ? room.current_speakers + 1 
          : action === 'revoke' && participant.role === 'speaker'
          ? Math.max(0, room.current_speakers - 1)
          : room.current_speakers,
        max_speakers: room.max_speakers
      }
    });
    
  } catch (error) {
    console.error('Grant mic error:', error);
    return jsonErr(error.message || 'Failed to manage microphone access');
  }
});




