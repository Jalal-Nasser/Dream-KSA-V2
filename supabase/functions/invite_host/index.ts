import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const InviteHostSchema = z.object({
  agency_id: z.string().uuid(),
  invitee_email: z.string().email(),
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
    const { agency_id, invitee_email, message } = InviteHostSchema.parse(body);
    
    // Check if user is the agency owner
    const { data: agency, error: agencyError } = await adminClient()
      .from('agencies')
      .select('id, name, owner_id')
      .eq('id', agency_id)
      .eq('is_active', true)
      .single();
      
    if (agencyError || !agency) {
      return jsonErr('Agency not found or inactive');
    }
    
    if (agency.owner_id !== user.id) {
      return jsonErr('Only agency owners can invite hosts');
    }
    
    // Find the invitee user by email
    const { data: inviteeUser, error: inviteeError } = await adminClient().auth.admin.listUsers();
    
    if (inviteeError) {
      return jsonErr('Failed to search for users');
    }
    
    const invitee = inviteeUser.users.find(u => u.email === invitee_email);
    if (!invitee) {
      return jsonErr('User with this email not found');
    }
    
    // Check if user is already a host in this agency
    const { data: existingHost, error: hostCheckError } = await adminClient()
      .from('hosts')
      .select('id')
      .eq('user_id', invitee.id)
      .eq('agency_id', agency_id)
      .single();
      
    if (hostCheckError && hostCheckError.code !== 'PGRST116') {
      return jsonErr('Error checking existing host status');
    }
    
    if (existingHost) {
      return jsonErr('User is already a host in this agency');
    }
    
    // Check if there's already a pending invitation
    const { data: existingInvite, error: inviteCheckError } = await adminClient()
      .from('agency_invites')
      .select('id')
      .eq('agency_id', agency_id)
      .eq('invitee_id', invitee.id)
      .eq('status', 'pending')
      .single();
      
    if (inviteCheckError && inviteCheckError.code !== 'PGRST116') {
      return jsonErr('Error checking existing invitations');
    }
    
    if (existingInvite) {
      return jsonErr('User already has a pending invitation to this agency');
    }
    
    // Create the invitation
    const { data: invitation, error: createError } = await adminClient()
      .from('agency_invites')
      .insert({
        agency_id,
        invitee_id: invitee.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();
      
    if (createError) {
      return jsonErr(`Failed to create invitation: ${createError.message}`);
    }
    
    // TODO: Send email notification to invitee
    // This would typically be done through a separate email service
    
    return jsonOK({
      invitation,
      message: 'Host invitation sent successfully'
    });
    
  } catch (error) {
    console.error('Invite host error:', error);
    return jsonErr(error.message || 'Failed to invite host');
  }
});




