/**
 * supabase.ts (project-root shim)
 * Re-exports the real supabase client from common locations, Metro-friendly.
 * Backed-up original saved as supabase.ts.bak_<TIMESTAMP> if present.
 *
 * NOTE: This file intentionally avoids 'export * from <variable>' which is invalid.
 */

(function() {
  // timestamp safe backup was created by the caller before overwrite
  // Try common canonical locations in order.
  const tried = [];
  function tryRequire(p) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const mod = require(p);
      tried.push({ path: p, ok: true });
      return mod;
    } catch (e) {
      tried.push({ path: p, ok: false, err: e && e.message });
      return null;
    }
  }

  const candidates = [
    './src/supabase',
    './src/lib/supabase',
    './supabase',
    './src/supabase/index',
    './supabase/index',
  ];

  let client = null;
  for (const c of candidates) {
    const m = tryRequire(c);
    if (m) {
      client = m;
      break;
    }
  }

  if (!client) {
    // Fall back to a helpful stub so the bundler doesn't crash outright.
    // eslint-disable-next-line no-console
    console.warn('[supabase shim] no supabase client found in common paths:', tried);
    client = {
      supabase: null,
      createClient: () => {
        throw new Error('supabase shim: real client not found. Create ./src/supabase or update imports to "@/supabase"');
      },
    };
  }

  // Export for CommonJS consumers and provide a `.default` for ES-style imports.
  // Avoid using `export * from client;` which is invalid when `client` is a runtime variable.
  module.exports = client;
  module.exports.default = client;
  // copy named exports (so `const { supabase } = require('./supabase')` works)
  try {
    if (client && typeof client === 'object') {
      Object.keys(client).forEach((k) => {
        if (k !== 'default' && !(k in module.exports)) {
          module.exports[k] = client[k];
        }
      });
    }
  } catch (e) {
    // ignore
  }
})();
