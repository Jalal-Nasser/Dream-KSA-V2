import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Schema for payout request
const RequestPayoutSchema = z.object({
  payout_id: z.string().uuid(),
  payout_method: z.enum(['bank_transfer', 'paypal', 'stripe']).default('bank_transfer'),
  account_details: z.object({
    account_number: z.string().optional(),
    routing_number: z.string().optional(),
    paypal_email: z.string().email().optional(),
    stripe_account: z.string().optional()
  }).optional()
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication token')
    }

    // Parse request body
    const body = await req.json()
    const { payout_id, payout_method, account_details } = RequestPayoutSchema.parse(body)

    // Get the payout details and verify ownership
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select(`
        id,
        host_id,
        agency_id,
        amount,
        status,
        monthly_earnings_id,
        hosts (
          user_id,
          agencies (
            owner_id
          )
        )
      `)
      .eq('id', payout_id)
      .single()

    if (payoutError || !payout) {
      throw new Error('Payout not found')
    }

    // Check if payout is already processed
    if (payout.status !== 'pending') {
      throw new Error('Payout is already processed or in progress')
    }

    // Verify user has permission to request this payout
    const isHost = payout.hosts.user_id === user.id
    const isAgencyOwner = payout.hosts.agencies.owner_id === user.id

    if (!isHost && !isAgencyOwner) {
      throw new Error('You do not have permission to request this payout')
    }

    // Update payout status to processing
    const { data: updatedPayout, error: updateError } = await supabase
      .from('payouts')
      .update({
        status: 'processing',
        payout_method,
        updated_at: new Date().toISOString()
      })
      .eq('id', payout_id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update payout status: ${updateError.message}`)
    }

    // TODO: Integrate with actual payment processor (Stripe, PayPal, etc.)
    // This would typically involve:
    // 1. Creating a transfer/withdrawal request
    // 2. Handling webhooks for success/failure
    // 3. Updating payout status based on result

    // For now, we'll simulate a successful processing
    // In production, this would be handled asynchronously

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payout request submitted successfully',
        payout: updatedPayout,
        estimated_processing_time: '3-5 business days'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Request payout error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to request payout',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})




