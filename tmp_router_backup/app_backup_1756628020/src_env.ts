/**
 * canonical env module (created/ensured by diagnostic)
 * - Exports ENV and HMS_ROLES
 * - Exports logEnvOnce(key, payload?) which prints env info only once per key
 * - Exports default ENV
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

/**
 * logEnvOnce(key, payload?)
 * Logs a diagnostic message exactly once per key across app lifetime.
 * Useful for dev-only environment logging called from multiple modules.
 */
export function logEnvOnce(key: string, payload?: any) {
  try {
    // attach to global so multiple module copies still share state
    // @ts-ignore
    const g = (global as any);
    if (!g.__env_logged_keys) g.__env_logged_keys = new Set();
    if (!g.__env_logged_keys.has(key)) {
      // eslint-disable-next-line no-console
      console.log('[ENV]', key, payload ?? ENV);
      g.__env_logged_keys.add(key);
    }
  } catch (e) {
    // ignore logging errors
  }
}

export default ENV;
