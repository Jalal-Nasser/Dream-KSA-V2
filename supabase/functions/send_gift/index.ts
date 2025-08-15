import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const SendGiftSchema = z.object({
  room_id: z.string().uuid(),
  receiver_host_id: z.string().uuid(),
  gift_id: z.string().uuid(),
  message: z.string().optional()
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
    const { room_id, receiver_host_id, gift_id, message } = SendGiftSchema.parse(body);
    
    // Verify the gift exists and get its details
    const { data: giftCatalog, error: giftError } = await adminClient()
      .from('gifts_catalog')
      .select('id, name, points, icon_url')
      .eq('id', gift_id)
      .eq('is_active', true)
      .single();
      
    if (giftError || !giftCatalog) {
      return jsonErr('Gift not found or inactive');
    }
    
    // Verify the receiver host exists
    const { data: host, error: hostError } = await adminClient()
      .from('hosts')
      .select(`
        id,
        user_id,
        agency_id,
        agencies (
          id,
          name,
          payout_split
        )
      `)
      .eq('id', receiver_host_id)
      .eq('is_active', true)
      .single();
      
    if (hostError || !host) {
      return jsonErr('Host not found or inactive');
    }
    
    // Verify the room exists and is live
    const { data: room, error: roomError } = await adminClient()
      .from('rooms')
      .select('id, name, is_live, owner_id')
      .eq('id', room_id)
      .eq('is_active', true)
      .single();
      
    if (roomError || !room) {
      return jsonErr('Room not found or inactive');
    }
    
    if (!room.is_live) {
      return jsonErr('Cannot send gifts to inactive rooms');
    }
    
    // Check if sender is trying to gift themselves
    if (user.id === host.user_id) {
      return jsonErr('Cannot send gifts to yourself');
    }
    
    // Create the gift record
    const { data: gift, error: createError } = await adminClient()
      .from('gifts')
      .insert({
        room_id,
        sender_id: user.id,
        receiver_host_id,
        gift_id,
        points: giftCatalog.points,
        message
      })
      .select(`
        id,
        points,
        message,
        created_at,
        gifts_catalog (
          name,
          icon_url
        )
      `)
      .single();
      
    if (createError) {
      return jsonErr(`Failed to send gift: ${createError.message}`);
    }
    
    // Update host's monthly gifts count
    const { error: updateError } = await adminClient()
      .from('hosts')
      .update({ 
        monthly_gifts: host.monthly_gifts + 1 
      })
      .eq('id', receiver_host_id);
      
    if (updateError) {
      console.error('Error updating host monthly gifts:', updateError);
      // Continue anyway as the gift was sent
    }
    
    // TODO: Send real-time notification to host about the gift
    // This would typically be done through Supabase Realtime
    
    return jsonOK({
      gift,
      message: 'Gift sent successfully'
    });
    
  } catch (error) {
    console.error('Send gift error:', error);
    return jsonErr(error.message || 'Failed to send gift');
  }
});




