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
  name: 'DreamKSA',
  slug: 'dreams-ksa',
  owner: 'jnasser',
  scheme: 'dream-ksa',
  version: '0.5.0-beta',
  icon: './assets/images/icon.png',

  android: {
    package: 'app.dreamksa',
    versionCode: 5,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFF0F3',
    },
    intentFilters: [
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
        data: [{ scheme: 'dream-ksa' }],
      },
    ],
    permissions: [],
  },
  ios: {
    bundleIdentifier: 'app.dreamksa',
    icon: './assets/images/icon.png',
  },

  orientation: 'portrait',
  platforms: ['ios', 'android'],
  extra: {
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: { projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id' }
  },
  updates: { 
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || 'your-eas-project-id'}` 
  },
};
