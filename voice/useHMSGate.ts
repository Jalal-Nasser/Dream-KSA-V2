/**
 * shim: voice/useHMSGate.ts (and app/src variants)
 * Metro-friendly shim that re-exports canonical src/voice/useHMSGate if present,
 * otherwise provides a safe, non-throwing development stub.
 */

try {
  // Static require acceptable to Metro
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const impl = require('../src/voice/useHMSGate');
  module.exports = impl;
  exports.default = impl.default || impl;
  Object.keys(impl).forEach(k => { if (k !== 'default') exports[k] = impl[k]; });
} catch (e) {
  // Fallback stub
  // eslint-disable-next-line no-console
  console.warn('[voice/useHMSGate shim] canonical src/voice/useHMSGate not found. Using fallback stub.', e && e.message);

  function useHMSGate(roomId, displayName, micStatus) {
    const hms = {
      join: async (opts) => {
        console.warn('[useHMSGate stub] join called', { roomId, opts });
        return { ok: false, error: 'stub' };
      },
      leave: async () => {
        console.warn('[useHMSGate stub] leave called', { roomId });
        return { ok: false, error: 'stub' };
      },
      localPeer: { id: 'stub-local', name: displayName || 'You', role: micStatus === 'granted' ? 'speaker' : 'listener' }
    };
    const peers = [];
    const isNativePresent = false;
    return { hms, peers, isNativePresent };
  }

  module.exports = {
    __esModule: true,
    default: useHMSGate,
    useHMSGate,
  };
}
