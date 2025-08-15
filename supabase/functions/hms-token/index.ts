import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const TokenRequestSchema = z.object({
  user_id: z.string().uuid(),
  user_name: z.string().min(1),
  role: z.enum(['room_admin', 'speaker', 'listener']),
  room_id: z.string().uuid()
});

serve(async (req) => {
  // Handle CORS preflight
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
    const { user_id, user_name, role, room_id } = TokenRequestSchema.parse(body);
    
    // Verify user is requesting token for themselves
    if (user.id !== user_id) {
      return jsonErr('Unauthorized: Can only request token for yourself');
    }
    
    // Get environment variables
    const hmsManagementToken = Deno.env.get('HMS_MANAGEMENT_TOKEN');
    const hmsSubdomain = Deno.env.get('HMS_SUBDOMAIN');
    
    if (!hmsManagementToken || !hmsSubdomain) {
      return jsonErr('HMS configuration missing');
    }
    
    // Generate 100ms token
    const tokenResponse = await fetch(`https://${hmsSubdomain}.100ms.live/api/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hmsManagementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room_id,
        user_id,
        role,
        user_name
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return jsonErr(`Failed to generate HMS token: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    return jsonOK({
      token: tokenData.token,
      room_id,
      user_id,
      role
    });
    
  } catch (error) {
    console.error('HMS token error:', error);
    return jsonErr(error.message || 'Failed to generate token');
  }
});




