import { ExpoConfig } from 'expo/config';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Resolve .env at project root (same folder as this file)
const ENV_PATH = path.resolve(__dirname, '.env');

// Load if exists
if (fs.existsSync(ENV_PATH)) {
  dotenv.config({ path: ENV_PATH });
} else {
  console.warn('[app.config.ts] .env not found at', ENV_PATH);
}

// Helper to read and strip accidental quotes
const read = (k: string) => {
  let v = process.env[k];
  if (typeof v === 'string') {
    // strip surrounding single/double quotes and trim whitespace
    v = v.trim().replace(/^["']|["']$/g, '');
  }
  return v;
};

const config: ExpoConfig = {
  name: 'Dream KSA',
  slug: 'dream-ksa',
  scheme: 'dream-ksa',
  orientation: 'portrait',
  platforms: ['ios','android'],
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: read('EXPO_PUBLIC_SUPABASE_URL'),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: read('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  },
};

// Minimal diagnostic (safe to keep)
const urlPrefix = (config.extra?.EXPO_PUBLIC_SUPABASE_URL || '').slice(0, 40);
const anonLen = (config.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').length;
console.log('[app.config.ts] URL prefix:', urlPrefix, '…  ANON len:', anonLen);

export default config;