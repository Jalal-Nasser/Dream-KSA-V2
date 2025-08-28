/**
 * src/env.ts
 * Canonical ENV loader used across the app.
 * Reads from Expo public env variables at runtime (process.env).
 * Safe defaults provided so the app won't crash if variables are missing.
 */

export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  FUNCTIONS_BASE: process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL ?? '',
  HMS_TOKEN_URL: process.env.EXPO_PUBLIC_HMS_TOKEN_URL ?? '',
  HMS_LISTENER_ROLE: process.env.EXPO_PUBLIC_HMS_LISTENER_ROLE ?? 'listener',
  HMS_SPEAKER_ROLE: process.env.EXPO_PUBLIC_HMS_SPEAKER_ROLE ?? 'speaker',
  HMS_MODERATOR_ROLE: process.env.EXPO_PUBLIC_HMS_MODERATOR_ROLE ?? 'moderator',
};

export const HMS_ROLES = {
  listener: ENV.HMS_LISTENER_ROLE,
  speaker: ENV.HMS_SPEAKER_ROLE,
  moderator: ENV.HMS_MODERATOR_ROLE,
};

export default ENV;
