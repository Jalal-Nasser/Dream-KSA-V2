// Auto-load environment variables:
// 1) Prefer .env.local at repo root
// 2) Fallback to .env if present
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
// scripts/supa-check.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase URL/Anon key in env (EXPO_PUBLIC_* or NEXT_PUBLIC_*).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginIfEnv() {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (!email || !password) {
    console.log('TEST_EMAIL/TEST_PASSWORD not set → skipping sign-in. RPC requiring auth will fail with "Not authenticated".');
    return null;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('signIn error:', error);
    return null;
  }
  console.log('Signed in as', data.user?.id);
  return data.user ?? null;
}

async function rpcCreateAgency() {
  await loginIfEnv();

  const { data, error } = await supabase.rpc('create_agency', {
    p_name: 'Test Agency',
    p_description: 'Created from scripts/supa-check.mjs',
    p_metadata: { origin: 'script' },
  });

  console.log('create_agency', { data, error });
}

async function ping() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  console.log('ping', { data, error });
}

const cmd = process.argv[2];
if (cmd === 'rpc') {
  rpcCreateAgency().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  ping().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
