/**
 * app/db/mic.ts - shim to avoid dynamic require / Metro invalid call
 * This file re-exports the canonical implementation from ../../src/db/mic if present.
 * If not present, it provides safe no-op stubs so Metro doesn't crash during bundling.
 *
 * Backed-up originals are saved as app/db/mic.ts.bak_<TIMESTAMP>.ts before overwrite.
 */

try {
  // Static require is acceptable to Metro. Try the canonical path.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const impl = require('../../src/db/mic');
  // support both CommonJS and ES module shapes
  module.exports = impl;
  exports.default = impl.default || impl;
  Object.keys(impl).forEach(k => { if (k !== 'default') exports[k] = impl[k]; });
} catch (e) {
  // Fallback stub implementation (non-throwing, logs warnings).
  // This allows the app to bundle and run during migration; replace with real impl later.
  // eslint-disable-next-line no-console
  console.warn('[app/db/mic shim] ../../src/db/mic not found. Using fallback stubs.');

  // Type-friendly stubs (no-op / useful warnings)
  const raiseHand = async (userId, roomId) => {
    console.warn('[mic.stub] raiseHand called but real implementation missing', { userId, roomId });
    return { ok: false, error: 'not_implemented' };
  };

  const cancelHand = async (userId, roomId) => {
    console.warn('[mic.stub] cancelHand called but real implementation missing', { userId, roomId });
    return { ok: false, error: 'not_implemented' };
  };

  const grantMic = async (adminId, userId, roomId) => {
    console.warn('[mic.stub] grantMic called but real implementation missing', { adminId, userId, roomId });
    return { ok: false, error: 'not_implemented' };
  };

  const revokeMic = async (adminId, userId, roomId) => {
    console.warn('[mic.stub] revokeMic called but real implementation missing', { adminId, userId, roomId });
    return { ok: false, error: 'not_implemented' };
  };

  const listenRoom = (roomId, onChange) => {
    console.warn('[mic.stub] listenRoom called but real implementation missing', { roomId });
    // Return a dummy unsubscribe function
    return () => {};
  };

  module.exports = {
    raiseHand,
    cancelHand,
    grantMic,
    revokeMic,
    listenRoom,
  };
  exports.default = module.exports;
}