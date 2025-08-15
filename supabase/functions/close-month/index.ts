import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, getProfileRole, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const CloseMonthSchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/), // Format: YYYY-MM
  points_per_currency: z.number().positive().optional() // Optional override
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
      return jsonErr('Only admin users can close months');
    }
    
    // Parse request body
    const body = await req.json();
    const { month_year, points_per_currency: overridePointsPerCurrency } = CloseMonthSchema.parse(body);
    
    // Get required environment variables
    const pointsPerCurrency = overridePointsPerCurrency || Deno.env.get('POINTS_PER_CURRENCY');
    const defaultAgencySplit = Deno.env.get('DEFAULT_AGENCY_SPLIT');
    
    if (!pointsPerCurrency) {
      return jsonErr('Missing required environment variable: POINTS_PER_CURRENCY');
    }
    if (!defaultAgencySplit) {
      return jsonErr('Missing required environment variable: DEFAULT_AGENCY_SPLIT');
    }
    
    const finalPointsPerCurrency = parseInt(pointsPerCurrency.toString());
    const finalDefaultAgencySplit = parseInt(defaultAgencySplit);
    
    // Check if month is already closed
    const { data: existingMonth, error: monthCheckError } = await adminClient()
      .from('monthly_earnings')
      .select('id, is_finalized')
      .eq('month_year', month_year)
      .eq('is_finalized', true)
      .limit(1);
      
    if (monthCheckError) {
      return jsonErr('Error checking month status');
    }
    
    if (existingMonth && existingMonth.length > 0) {
      return jsonErr('Month is already closed and finalized');
    }
    
    // Get all hosts and their gifts for the month
    const { data: hosts, error: hostsError } = await adminClient()
      .from('hosts')
      .select(`
        id,
        user_id,
        agency_id,
        monthly_gifts,
        agencies (
          id,
          name,
          payout_split
        )
      `)
      .eq('is_active', true);
      
    if (hostsError) {
      return jsonErr('Failed to fetch hosts');
    }
    
    const monthlyEarnings = [];
    
    for (const host of hosts) {
      // Get gifts for this host in the specified month
      const { data: gifts, error: giftsError } = await adminClient()
        .from('gifts')
        .select('id, points')
        .eq('receiver_host_id', host.id)
        .gte('created_at', `${month_year}-01T00:00:00Z`)
        .lt('created_at', `${month_year}-31T23:59:59Z`);
        
      if (giftsError) {
        console.error(`Error fetching gifts for host ${host.id}:`, giftsError);
        continue;
      }
      
      const totalGifts = gifts.length;
      const totalPoints = gifts.reduce((sum, gift) => sum + gift.points, 0);
      const totalCurrency = totalPoints / finalPointsPerCurrency;
      
      // Calculate payout splits
      const agencySplit = (host.agencies.payout_split / 100) * totalCurrency;
      const hostSplit = totalCurrency - agencySplit;
      
      // Create or update monthly earnings record
      const { data: earnings, error: earningsError } = await adminClient()
        .from('monthly_earnings')
        .upsert({
          host_id: host.id,
          agency_id: host.agency_id,
          month_year,
          total_gifts: totalGifts,
          total_points: totalPoints,
          total_currency: totalCurrency,
          agency_share: agencySplit,
          host_share: hostSplit,
          is_finalized: false
        }, {
          onConflict: 'host_id,month_year'
        })
        .select()
        .single();
        
      if (earningsError) {
        console.error(`Error creating earnings for host ${host.id}:`, earningsError);
        continue;
      }
      
      monthlyEarnings.push(earnings);
      
      // Reset host's monthly gifts count
      await adminClient()
        .from('hosts')
        .update({ monthly_gifts: 0 })
        .eq('id', host.id);
    }
    
    return jsonOK({
      message: `Month ${month_year} closed successfully`,
      total_hosts: hosts.length,
      monthly_earnings: monthlyEarnings,
      points_per_currency: finalPointsPerCurrency,
      default_agency_split: finalDefaultAgencySplit
    });
    
  } catch (error) {
    console.error('Close month error:', error);
    return jsonErr(error.message || 'Failed to close month');
  }
});

