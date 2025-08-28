/**
 * shim: voice/useHmsLevels.ts (and app/src variants)
 * Metro-friendly shim that re-exports canonical src/voice/useHmsLevels if present,
 * otherwise provides a safe, non-throwing development stub.
 */

try {
  // Static require acceptable to Metro
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const impl = require('./useHmsLevels');
  module.exports = impl;
  exports.default = impl.default || impl;
  Object.keys(impl).forEach(k => { if (k !== 'default') exports[k] = impl[k]; });
} catch (e) {
  // Fallback stub
  // eslint-disable-next-line no-console
  console.warn('[voice/useHmsLevels shim] canonical src/voice/useHmsLevels not found. Using fallback stub.', e && e.message);

  function useHmsLevels(roomId) {
    // return a minimal API matching expected shape:
    // { levels: Map(peerId -> level), subscribe: fn, unsubscribe: fn }
    const levels = {};
    const subscribe = (onChange) => {
      console.warn('[useHmsLevels stub] subscribe called', { roomId });
      // no-op; return unsubscribe
      return () => {};
    };
    const unsubscribe = () => {
      console.warn('[useHmsLevels stub] unsubscribe called', { roomId });
    };
    return { levels, subscribe, unsubscribe };
  }

  module.exports = {
    __esModule: true,
    default: useHmsLevels,
    useHmsLevels,
  };
}


