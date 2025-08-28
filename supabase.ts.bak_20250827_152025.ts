/**
 * supabase shim (project root)
 * Allows imports like '../../supabase' to work while the real client lives in src/.
 * This file will attempt common candidate locations and re-export whatever it finds.
 * It's safe to keep long-term or replace later by updating imports to @/supabase or './src/supabase'.
 */
let client = null;
const tried = [];

function tryRequire(p) {
  try {
    tried.push({ path: p, ok: true });
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    return require(p);
  } catch (e) {
    tried.push({ path: p, ok: false });
    return null;
  }
}

// candidate locations  order matters
const candidates = [
  './src/supabase',
  './src/lib/supabase',
  './supabase',
  './src/supabase/index',
  './supabase/index',
];

for (const c of candidates) {
  const mod = tryRequire(c);
  if (mod) {
    client = mod;
    break;
  }
}

// If nothing found, export an object with a helpful stub so imports don't crash immediately.
if (!client) {
  // eslint-disable-next-line no-console
  console.warn('[supabase shim] no supabase client found at common paths:', tried);
  client = {
    // caller code expecting supabase can use this object safely until you migrate imports
    supabase: null,
    createClient: () => {
      throw new Error('supabase shim: real client not found. Please ensure ./src/supabase exists or update imports to "@/supabase"');
    },
  };
}

// re-export (support both CommonJS consumers and ES imports)
module.exports = client;
export default client;
export * from client;
