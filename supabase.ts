/**
 * supabase.ts - Metro-safe static shim
 * Re-exports the real supabase client if found at common canonical locations.
 * This version uses ONLY static require() calls (no dynamic require(variable)).
 * Backup of the original is created by the caller before overwrite.
 */

(function () {
  // Candidate paths — each is required statically inside its own try/catch.
  let client = null;
  let foundAt = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    client = require('./src/supabase');
    foundAt = './src/supabase';
  } catch (e1) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      client = require('./src/lib/supabase');
      foundAt = './src/lib/supabase';
    } catch (e2) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        client = require('./supabase');
        foundAt = './supabase';
      } catch (e3) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
          client = require('./src/supabase/index');
          foundAt = './src/supabase/index';
        } catch (e4) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
            client = require('./supabase/index');
            foundAt = './supabase/index';
          } catch (e5) {
            client = null;
            foundAt = null;
          }
        }
      }
    }
  }

  if (!client) {
    // eslint-disable-next-line no-console
    console.warn('[supabase shim] no supabase client found at common locations. Falling back to helpful stub.');
    client = {
      supabase: null,
      createClient: () => {
        throw new Error('supabase shim: real client not found. Create ./src/supabase or update imports to "@/supabase"');
      },
    };
  } else {
    // eslint-disable-next-line no-console
    console.log('[supabase shim] re-exporting client from', foundAt);
  }

  // Provide both CommonJS and ES-style exports
  module.exports = client;
  module.exports.default = client;
  // copy named exports if object
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
