// Shared utilities for Supabase Edge Functions
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create client with caller's authorization (uses anon key)
export function userClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Create admin client with service role (requires service role key)
export function adminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Create client with caller's authorization from request
export function userClientFromReq(req: Request): SupabaseClient {
  const client = userClient();
  
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    client.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });
  }
  
  return client;
}

// Get user from request
export async function getUserFromReq(req: Request) {
  const client = userClientFromReq(req);
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }
  
  const { data: { user }, error } = await client.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  
  if (error || !user) {
    throw new Error('Invalid authentication token');
  }
  
  return user;
}

// Get profile role
export async function getProfileRole(client: SupabaseClient, userId: string) {
  const { data: profile, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !profile) {
    throw new Error('User profile not found');
  }
  
  return profile.role;
}

// Response helpers
export function jsonOK(data: any = {}) {
  return new Response(
    JSON.stringify({ ok: true, ...data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

export function jsonErr(message: string, status: number = 400, details?: any) {
  return new Response(
    JSON.stringify({ 
      ok: false, 
      error: message,
      details: details || null
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  );
}

export { corsHeaders, createClient, z };

