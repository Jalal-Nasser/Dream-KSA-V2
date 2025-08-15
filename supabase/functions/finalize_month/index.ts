import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, getProfileRole, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const FinalizeMonthSchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/) // Format: YYYY-MM
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
    
    // Check if user is admin
    const userRole = await getProfileRole(adminClient(), user.id);
    if (userRole !== 'admin') {
      return jsonErr('Only admin users can finalize months');
    }
    
    // Parse request body
    const body = await req.json();
    const { month_year } = FinalizeMonthSchema.parse(body);
    
    // Get all monthly earnings for the month that are not finalized
    const { data: monthlyEarnings, error: earningsError } = await adminClient()
      .from('monthly_earnings')
      .select(`
        id,
        host_id,
        agency_id,
        month_year,
        total_currency,
        agency_share,
        host_share,
        is_finalized
      `)
      .eq('month_year', month_year)
      .eq('is_finalized', false);
      
    if (earningsError) {
      return jsonErr('Failed to fetch monthly earnings');
    }
    
    if (!monthlyEarnings || monthlyEarnings.length === 0) {
      return jsonErr('No monthly earnings found for this month');
    }
    
    // Finalize all monthly earnings
    const { error: finalizeError } = await adminClient()
      .from('monthly_earnings')
      .update({ is_finalized: true })
      .eq('month_year', month_year)
      .eq('is_finalized', false);
      
    if (finalizeError) {
      return jsonErr(`Failed to finalize monthly earnings: ${finalizeError.message}`);
    }
    
    // Create payout records for all finalized earnings
    const payouts = [];
    for (const earning of monthlyEarnings) {
      // Create host payout
      if (earning.host_share > 0) {
        const { data: hostPayout, error: hostPayoutError } = await adminClient()
          .from('payouts')
          .insert({
            host_id: earning.host_id,
            agency_id: earning.agency_id,
            monthly_earnings_id: earning.id,
            amount: earning.host_share,
            status: 'pending',
            payout_method: 'bank_transfer'
          })
          .select()
          .single();
          
        if (hostPayoutError) {
          console.error(`Error creating host payout for ${earning.host_id}:`, hostPayoutError);
        } else {
          payouts.push(hostPayout);
        }
      }
      
      // Create agency payout
      if (earning.agency_share > 0) {
        const { data: agencyPayout, error: agencyPayoutError } = await adminClient()
          .from('payouts')
          .insert({
            host_id: earning.host_id,
            agency_id: earning.agency_id,
            monthly_earnings_id: earning.id,
            amount: earning.agency_share,
            status: 'pending',
            payout_method: 'bank_transfer'
          })
          .select()
          .single();
          
        if (agencyPayoutError) {
          console.error(`Error creating agency payout for ${earning.agency_id}:`, agencyPayoutError);
        } else {
          payouts.push(agencyPayout);
        }
      }
    }
    
    return jsonOK({
      message: `Month ${month_year} finalized successfully`,
      total_earnings: monthlyEarnings.length,
      total_payouts: payouts.length,
      month_year
    });
    
  } catch (error) {
    console.error('Finalize month error:', error);
    return jsonErr(error.message || 'Failed to finalize month');
  }
});






