import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, getProfileRole, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const RequestPayoutSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/) // Format: YYYY-MM
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
    const { month } = RequestPayoutSchema.parse(body);
    
    // Get user role
    const userRole = await getProfileRole(adminClient(), user.id);
    
    let payouts = [];
    
    if (userRole === 'admin') {
      // Admin can see all pending payouts
      const { data: allPayouts, error: allPayoutsError } = await adminClient()
        .from('payouts')
        .select(`
          id,
          month,
          beneficiary_type,
          beneficiary_id,
          agency_id,
          amount,
          status,
          created_at
        `)
        .eq('month', month)
        .eq('status', 'pending');
        
      if (allPayoutsError) {
        return jsonErr('Error fetching payouts');
      }
      
      payouts = allPayouts || [];
      
    } else if (userRole === 'agency_owner') {
      // Agency owner can see payouts for their agencies
      const { data: agencyPayouts, error: agencyPayoutsError } = await adminClient()
        .from('payouts')
        .select(`
          id,
          month,
          beneficiary_type,
          beneficiary_id,
          agency_id,
          amount,
          status,
          created_at
        `)
        .eq('month', month)
        .eq('status', 'pending')
        .in('agency_id', (
          await adminClient()
            .from('agencies')
            .select('id')
            .eq('owner_id', user.id)
        ).data?.map(a => a.id) || []);
        
      if (agencyPayoutsError) {
        return jsonErr('Error fetching agency payouts');
      }
      
      payouts = agencyPayouts || [];
      
    } else if (userRole === 'host') {
      // Host can see their own payouts
      const { data: hostPayouts, error: hostPayoutsError } = await adminClient()
        .from('payouts')
        .select(`
          id,
          month,
          beneficiary_type,
          beneficiary_id,
          agency_id,
          amount,
          status,
          created_at
        `)
        .eq('month', month)
        .eq('status', 'pending')
        .eq('beneficiary_id', user.id);
        
      if (hostPayoutsError) {
        return jsonErr('Error fetching host payouts');
      }
      
      payouts = hostPayouts || [];
      
    } else {
      return jsonErr('Insufficient permissions to request payouts');
    }
    
    if (payouts.length === 0) {
      return jsonErr('No pending payouts found for this month');
    }
    
    // Update payout status to processing
    const payoutIds = payouts.map(p => p.id);
    const { error: updateError } = await adminClient()
      .from('payouts')
      .update({ status: 'processing' })
      .in('id', payoutIds);
      
    if (updateError) {
      return jsonErr('Failed to update payout status');
    }
    
    return jsonOK({
      message: 'Payout requests processed successfully',
      month,
      payouts_processed: payouts.length,
      payouts: payouts.map(p => ({ ...p, status: 'processing' }))
    });
    
  } catch (error) {
    console.error('Request payout error:', error);
    return jsonErr(error.message || 'Failed to request payout');
  }
});

