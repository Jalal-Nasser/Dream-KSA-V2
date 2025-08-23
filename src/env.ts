export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  FUNCTIONS_BASE: process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL!,
  HMS_TOKEN_URL: process.env.EXPO_PUBLIC_HMS_TOKEN_URL!,
  HMS_LISTENER_ROLE: process.env.EXPO_PUBLIC_HMS_LISTENER_ROLE || 'viewer',
  HMS_SPEAKER_ROLE: process.env.EXPO_PUBLIC_HMS_SPEAKER_ROLE || 'host',
  HMS_MODERATOR_ROLE: process.env.EXPO_PUBLIC_HMS_MODERATOR_ROLE || 'moderator',
};

export const HMS_ROLES = {
  listener: ENV.HMS_LISTENER_ROLE,
  speaker: ENV.HMS_SPEAKER_ROLE,
  moderator: ENV.HMS_MODERATOR_ROLE,
};

let _printed = false;
export function logEnvOnce() {
  if (_printed) return;
  _printed = true;
  console.log('[ENV] URL:', ENV.SUPABASE_URL);
  console.log('[ENV] HMS roles', HMS_ROLES);
}

function assertEnv() {
  const missing = Object.entries(ENV).filter(([, v]) => !v);
  if (missing.length) {
    console.error('[ENV] Missing:', missing.map(([k]) => k).join(', '));
    throw new Error('Missing Supabase envs');
  }
}
assertEnv();

export default ENV;
