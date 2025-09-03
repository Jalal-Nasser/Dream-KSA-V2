// Load before any Supabase import/usage.
// Required by supabase-js on React Native / Expo.
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// Some libs still assume atob/btoa exist on RN.
import { decode, encode } from 'base-64';
// @ts-ignore
if (!global.atob) global.atob = decode as any;
// @ts-ignore
if (!global.btoa) global.btoa = encode as any;

// No exports — this file only installs polyfills.
