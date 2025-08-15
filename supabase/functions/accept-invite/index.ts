import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const AcceptInviteSchema = z.object({
  invite_id: z.string().uuid()
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
    const { invite_id } = AcceptInviteSchema.parse(await req.json());
    
    // Get the invitation details
    const { data: invitation, error: inviteError } = await adminClient()
      .from('agency_invites')
      .select(`
        id,
        agency_id,
        invitee_id,
        status,
        expires_at,
        agencies (
          id,
          name,
          owner_id,
          payout_split
        )
      `)
      .eq('id', invite_id)
      .single();
      
    if (inviteError || !invitation) {
      return jsonErr('Invitation not found');
    }
    
    // Verify the invitation belongs to the current user
    if (invitation.invitee_id !== user.id) {
      return jsonErr('This invitation does not belong to you');
    }
    
    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return jsonErr('Invitation is no longer pending');
    }
    
    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark invitation as expired
      await adminClient()
        .from('agency_invites')
        .update({ status: 'expired' })
        .eq('id', invite_id);
        
      return jsonErr('Invitation has expired');
    }
    
    // Check if user is already a host in this agency
    const { data: existingHost, error: hostCheckError } = await adminClient()
      .from('hosts')
      .select('id')
      .eq('user_id', user.id)
      .eq('agency_id', invitation.agency_id)
      .single();
      
    if (hostCheckError && hostCheckError.code !== 'PGRST116') {
      return jsonErr('Error checking existing host status');
    }
    
    if (existingHost) {
      return jsonErr('You are already a host in this agency');
    }
    
    // Start a transaction to accept the invitation
    const { error: transactionError } = await adminClient().rpc('accept_host_invitation', {
      p_invite_id: invite_id,
      p_user_id: user.id,
      p_agency_id: invitation.agency_id
    });
    
    if (transactionError) {
      return jsonErr(`Failed to accept invitation: ${transactionError.message}`);
    }
    
    // Update user role to host
    const { error: roleUpdateError } = await adminClient()
      .from('profiles')
      .update({ role: 'host' })
      .eq('id', user.id);
      
    if (roleUpdateError) {
      console.error('Error updating user role:', roleUpdateError);
      // Continue anyway as the host record was created
    }
    
    return jsonOK({
      message: 'Invitation accepted successfully. You are now a host in this agency.',
      agency: invitation.agencies
    });
    
  } catch (error) {
    console.error('Accept invite error:', error);
    return jsonErr(error.message || 'Failed to accept invitation');
  }
});

