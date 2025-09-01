// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const cfg: ExpoConfig = {
  name: 'Dream KSA',
  slug: 'dream-ksa',
  scheme: 'dream-ksa',
  orientation: 'portrait',
  platforms: ['ios','android'],
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    // leave room for other public keys later
  },
};

// Helpful log at startup so you see what Expo injected:
console.log(
  '[app.config.ts] SUPABASE_URL:',
  (process.env.EXPO_PUBLIC_SUPABASE_URL || '').slice(0, 40),
  '...  ANON len:', (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').length
);

export default cfg;
