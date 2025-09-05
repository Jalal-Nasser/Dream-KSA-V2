import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

// Create redirect URI with fallback for development
const baseRedirect = makeRedirectUri({
  scheme: 'dream-ksa',
  path: 'auth-callback',
  useProxy: false, // Force custom scheme instead of exp://
});

// Fallback: if we get exp:// URL in development, use custom scheme
export const redirectNative = baseRedirect.startsWith('exp://') 
  ? 'dream-ksa://auth-callback'
  : baseRedirect;

export function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code=');
}

export function logRedirects(tag = '[oauth]') {
  console.log(tag, 'USING native redirect:', redirectNative);
  if (!String(redirectNative).endsWith('dream-ksa://auth-callback')) {
    console.warn('[oauth] WARNING: redirectNative is not dream-ksa://auth-callback');
  }
}