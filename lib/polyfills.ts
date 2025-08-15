// Polyfills for environments where Array.prototype.findLast and findLastIndex
// are not yet available (needed by React Navigation / Expo Router in some setups)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* c8 ignore start */
if (!Array.prototype.findLastIndex) {
  Object.defineProperty(Array.prototype, 'findLastIndex', {
    value: function findLastIndexPolyfill(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: unknown) {
      if (this == null) throw new TypeError('Array.prototype.findLastIndex called on null or undefined');
      if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
      const list = Object(this) as any[];
      const length = list.length >>> 0;
      for (let index = length - 1; index >= 0; index -= 1) {
        const value = list[index];
        if (predicate.call(thisArg, value, index, list)) return index;
      }
      return -1;
    },
    configurable: true,
    writable: true,
  });
}

if (!Array.prototype.findLast) {
  Object.defineProperty(Array.prototype, 'findLast', {
    value: function findLastPolyfill(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: unknown) {
      const index = (this as any[]).findLastIndex(predicate, thisArg);
      return index === -1 ? undefined : (this as any[])[index];
    },
    configurable: true,
    writable: true,
  });
}
/* c8 ignore end */


