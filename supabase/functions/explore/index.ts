/**
 * Explore Edge Function
 * 
 * Public endpoint to fetch live rooms with sorting options.
 * 
 * Deploy: supabase functions deploy explore --no-verify-jwt
 * 
 * Example usage:
 * curl "https://<project-ref>.functions.supabase.co/explore?sort=featured"
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// Validate and normalize sort parameter
function validateSort(sort: string | null): string {
  const validSorts = ['featured', 'trending', 'active']
  if (!sort || !validSorts.includes(sort)) {
    return 'featured' // default fallback
  }
  return sort
}

// Build SQL ORDER BY clause based on sort parameter
function buildOrderBy(sort: string): string {
  switch (sort) {
    case 'featured':
      return 'featured DESC, trending_score DESC, last_active_at DESC'
    case 'trending':
      return 'trending_score DESC, last_active_at DESC'
    case 'active':
      return 'listener_count DESC, speaker_count DESC, last_active_at DESC'
    default:
      return 'featured DESC, trending_score DESC, last_active_at DESC'
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ 
        data: null, 
        error: 'Method not allowed. Only GET requests are supported.' 
      }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_ANON_KEY')
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: 'Server configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with anon key (public access)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Parse and validate query parameters
    const url = new URL(req.url)
    const sort = validateSort(url.searchParams.get('sort'))

    // Build the query with proper filtering and sorting
    const orderBy = buildOrderBy(sort)
    
    const { data, error } = await supabase
      .from('rooms_public_view')
      .select('*')
      .eq('is_live', true)
      .order(orderBy, { ascending: false })
      .limit(50)

    if (error) {
      console.error('Database query error:', error)
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: 'Failed to fetch rooms' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        data: data || [], 
        error: null 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        data: null, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/*
 * Self-test snippet:
 * 
 * # Test featured sorting
 * curl "https://<project-ref>.functions.supabase.co/explore?sort=featured"
 * 
 * # Test trending sorting  
 * curl "https://<project-ref>.functions.supabase.co/explore?sort=trending"
 * 
 * # Test active sorting
 * curl "https://<project-ref>.functions.supabase.co/explore?sort=active"
 * 
 * # Test default sorting (no sort param)
 * curl "https://<project-ref>.functions.supabase.co/explore"
 * 
 * # Test invalid sort parameter (should default to featured)
 * curl "https://<project-ref>.functions.supabase.co/explore?sort=invalid"
 */
