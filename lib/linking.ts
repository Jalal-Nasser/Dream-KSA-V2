import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession(); // required for web only (safe on native)

export const authRedirectUri = makeRedirectUri({ scheme: 'dream-ksa' }); 
// In Expo Go this will be exp://…; in dev/prod build it will be dream-ksa://auth-callback if configured.

export function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code=');
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'USING redirect:', authRedirectUri);
}