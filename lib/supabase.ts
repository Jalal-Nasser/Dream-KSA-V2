// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const anon =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error('Missing Supabase URL or anon key in env (EXPO_PUBLIC_* or NEXT_PUBLIC_*).');
}

export const supabase = createClient(url, anon);