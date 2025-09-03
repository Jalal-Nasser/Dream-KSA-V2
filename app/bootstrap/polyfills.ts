// Load before any Supabase import/usage.
// Required by supabase-js on React Native / Expo.
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
// Some libs still assume atob/btoa exist on RN; provide minimal polyfill.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { decode, encode } = require('base-64');
  // @ts-ignore
  if (!global.atob) global.atob = decode as any;
  // @ts-ignore
  if (!global.btoa) global.btoa = encode as any;
} catch (e) {
  // If base-64 isn’t available for some reason, continue without it.
}

// No exports — this file only installs polyfills.
