import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const redirectNative = makeRedirectUri({ scheme: 'dream-ksa' }); // → dream-ksa://auth-callback

export function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code=');
}

export function logRedirects(tag = '[oauth]') {
  console.log(tag, 'USING native redirect:', redirectNative);
}