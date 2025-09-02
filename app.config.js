const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const ENV_PATH = path.resolve(__dirname, '.env');
if (fs.existsSync(ENV_PATH)) dotenv.config({ path: ENV_PATH });

const read = (k) => {
  let v = process.env[k];
  if (typeof v === 'string') v = v.trim().replace(/^["']|["']$/g, '');
  return v;
};

let EXPO_PUBLIC_SUPABASE_URL = read('EXPO_PUBLIC_SUPABASE_URL') || 'https://kgcpeoidouajwytndtqi.supabase.co';
let EXPO_PUBLIC_SUPABASE_ANON_KEY = read('EXPO_PUBLIC_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnY3Blb2lkb3Vhand5dG5kdHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2MzgsImV4cCI6MjA2ODUzMzYzOH0.eV1GRnbrDIQ4xzZ6EsdNOzgGdxUoSFtOXJWoV71wxW4';

console.log('[app.config.js] URL prefix:', (EXPO_PUBLIC_SUPABASE_URL || '').slice(0, 40), '…  ANON len:', (EXPO_PUBLIC_SUPABASE_ANON_KEY || '').length);

module.exports = {
  name: 'Dream KSA',
  slug: 'dream-ksa',
  owner: 'jnasser',
  scheme: 'dream-ksa',

  android: {
    package: 'app.dreamksa',
    // Accept ANY path for the custom scheme to avoid matching issues
    intentFilters: [
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
        data: [{ scheme: 'dream-ksa' }],
      },
    ],
  },
  ios: {
    bundleIdentifier: 'app.dreamksa',
  },

  orientation: 'portrait',
  platforms: ['ios', 'android'],
  extra: {
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
