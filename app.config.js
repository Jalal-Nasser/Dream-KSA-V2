const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const ENV_PATH = path.resolve(__dirname, '.env');
if (fs.existsSync(ENV_PATH)) {
  dotenv.config({ path: ENV_PATH });
} else {
  console.warn('[app.config.js] .env not found at', ENV_PATH);
}

const read = (k) => {
  let v = process.env[k];
  if (typeof v === 'string') v = v.trim().replace(/^["']|["']$/g, '');
  return v;
};

// REQUIRED public values (either from .env or hardcoded fallback)
let EXPO_PUBLIC_SUPABASE_URL = read('EXPO_PUBLIC_SUPABASE_URL');
let EXPO_PUBLIC_SUPABASE_ANON_KEY = read('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// --- OPTIONAL EMERGENCY FALLBACK (now enabled as requested) ---
EXPO_PUBLIC_SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL || 'https://kgcpeoidouajwytndtqi.supabase.co';
EXPO_PUBLIC_SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnY3Blb2lkb3Vhand5dG5kdHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2MzgsImV4cCI6MjA2ODUzMzYzOH0.eV1GRnbrDIQ4xzZ6EsdNOzgGdxUoSFtOXJWoV71wxW4';

console.log('[app.config.js] URL prefix:', (EXPO_PUBLIC_SUPABASE_URL || '').slice(0, 40), '…  ANON len:', (EXPO_PUBLIC_SUPABASE_ANON_KEY || '').length);

module.exports = {
  name: 'Dream KSA',
  slug: 'dream-ksa',
  scheme: 'dream-ksa',
  orientation: 'portrait',
  platforms: ['ios','android'],
  extra: {
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
