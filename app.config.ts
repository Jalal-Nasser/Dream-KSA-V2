import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const read = (k: string) => {
  let v = process.env[k];
  if (typeof v === 'string') v = v.trim().replace(/^["']|["']$/g, '');
  return v;
};

let EXPO_PUBLIC_SUPABASE_URL = read('EXPO_PUBLIC_SUPABASE_URL') || 'https://kgcpeoidouajwytndtqi.supabase.co';
let EXPO_PUBLIC_SUPABASE_ANON_KEY = read('EXPO_PUBLIC_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnY3Blb2lkb3Vhand5dG5kdHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2MzgsImV4cCI6MjA2ODUzMzYzOH0.eV1GRnbrDIQ4xzZ6EsdNOzgGdxUoSFtOXJWoV71wxW4';

console.log('[app.config.ts] URL prefix:', (EXPO_PUBLIC_SUPABASE_URL || '').slice(0, 40), '…  ANON len:', (EXPO_PUBLIC_SUPABASE_ANON_KEY || '').length);

const config: ExpoConfig = {
  name: 'DreamKSA',
  slug: 'dreams-ksa',
  owner: 'jnasser',
  scheme: 'dream-ksa',
  version: '1.0.0',
  icon: './assets/images/icon.png',

  android: {
    package: 'com.dreamska.app',
    versionCode: 1,
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
    bundleIdentifier: 'com.dreamska.app',
    buildNumber: '1.0.0',
    icon: './assets/images/icon.png',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    },
    associatedDomains: ['dream-ksa://auth-callback']
  },

  orientation: 'portrait',
  platforms: ['ios', 'android'],
  extra: {
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL ?? "",
    eas: { projectId: '85a5b204-84e8-49fa-b88a-31b072ff798b' }
  },
  updates: { 
    url: 'https://u.expo.dev/85a5b204-84e8-49fa-b88a-31b072ff798b' 
  },
};

export default config;
