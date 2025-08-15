import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonOK, jsonErr, getUserFromReq, getProfileRole, adminClient, corsHeaders } from "../_shared/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const CreateAgencySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  payout_split: z.number().min(0).max(100).optional(),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional()
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
      return jsonErr('Only admin users can create agencies');
    }
    
    // Parse request body
    const body = await req.json();
    const { name, description, payout_split, logo_url, banner_url } = CreateAgencySchema.parse(body);
    
    // Get default agency split from environment
    const defaultAgencySplit = Deno.env.get('DEFAULT_AGENCY_SPLIT');
    if (!defaultAgencySplit) {
      return jsonErr('Missing required environment variable: DEFAULT_AGENCY_SPLIT');
    }
    
    const finalPayoutSplit = payout_split || parseInt(defaultAgencySplit);
    
    // Check if agency name already exists
    const { data: existingAgency, error: checkError } = await adminClient()
      .from('agencies')
      .select('id')
      .eq('name', name)
      .eq('is_active', true)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      return jsonErr('Error checking agency name');
    }
    
    if (existingAgency) {
      return jsonErr('Agency with this name already exists');
    }
    
    // Create the agency
    const { data: agency, error: createError } = await adminClient()
      .from('agencies')
      .insert({
        name,
        description,
        owner_id: user.id,
        payout_split: finalPayoutSplit,
        logo_url,
        banner_url,
        is_active: true
      })
      .select()
      .single();
      
    if (createError) {
      return jsonErr(`Failed to create agency: ${createError.message}`);
    }
    
    return jsonOK({
      agency,
      message: 'Agency created successfully'
    });
    
  } catch (error) {
    console.error('Create agency error:', error);
    return jsonErr(error.message || 'Failed to create agency');
  }
});

